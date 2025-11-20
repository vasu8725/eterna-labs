import 'dotenv/config';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { DexRouter } from '../dexRouter';
import { OrderJobData } from './orderQueue';
import { OrderStatus } from '../types';
import WebSocket from 'ws';

const prisma = new PrismaClient();
const dexRouter = new DexRouter();

const redisUrl = process.env.REDIS_URL || '';

const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    tls: {
        rejectUnauthorized: false
    }
});

// WebSocket connection to main server for sending updates
let serverWs: WebSocket | null = null;

function connectToServer() {
    serverWs = new WebSocket('ws://localhost:3000/worker');

    serverWs.on('open', () => {
        console.log('[Worker] Connected to main server');
    });

    serverWs.on('error', (error) => {
        console.error('[Worker] WebSocket error:', error);
    });

    serverWs.on('close', () => {
        console.log('[Worker] Disconnected from server, reconnecting in 3s...');
        setTimeout(connectToServer, 3000);
    });
}

// Connect to server on startup
connectToServer();

// Helper function to send order updates to main server
function sendOrderUpdate(order: any) {
    if (serverWs && serverWs.readyState === WebSocket.OPEN) {
        serverWs.send(JSON.stringify({
            type: 'order-update',
            order
        }));
    } else {
        console.warn('[Worker] WebSocket not connected, cannot send update');
    }
}

// Helper function to add log entries
async function addLog(orderId: string, status: OrderStatus, message: string, details?: any) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const existingLogs: any[] = Array.isArray(order?.logs) ? (order.logs as any[]) : [];

    const newLog = {
        timestamp: new Date().toISOString(),
        status,
        message,
        details
    };

    const updatedLogs = [...existingLogs, newLog];

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            logs: updatedLogs,
            status
        }
    });

    // Send update to main server via WebSocket
    sendOrderUpdate(updatedOrder);
    console.log(`[Worker] ${orderId}: ${message}`);
}

export const orderWorker = new Worker<OrderJobData>(
    'order-processing',
    async (job) => {
        const { orderId, tokenPair, amount } = job.data;

        console.log(`[Worker] Processing order ${orderId}`);

        try {
            // 1. Pending
            await addLog(orderId, 'pending', 'Order received and queued');

            // 2. Routing
            await addLog(orderId, 'routing', 'Comparing DEX prices');
            const quote = await dexRouter.getBestQuote(tokenPair, amount);

            await prisma.order.update({
                where: { id: orderId },
                data: { bestQuote: quote as any }
            });

            await addLog(orderId, 'routing', `Best quote found: ${quote.dex} @ $${quote.price.toFixed(2)}`, quote);

            // 3. Building
            await addLog(orderId, 'building', 'Creating transaction');
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 4. Signing
            await addLog(orderId, 'signing', 'Signing transaction');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 5. Sending
            await addLog(orderId, 'sending', 'Transaction sent to network');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 6. Confirmed
            const txHash = '0x' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
            await prisma.order.update({
                where: { id: orderId },
                data: { txHash }
            });

            await addLog(orderId, 'confirmed', 'Transaction successful', { txHash });

            console.log(`[Worker] Order ${orderId} completed successfully`);
            return { success: true, orderId };

        } catch (error) {
            console.error(`[Worker] Error processing order ${orderId}:`, error);

            const currentAttempt = job.attemptsMade + 1;
            const maxAttempts = job.opts.attempts || 1;

            // Log the specific error for this attempt
            await addLog(orderId, 'pending', `Attempt ${currentAttempt} failed: ${(error as Error).message}`);

            if (currentAttempt < maxAttempts) {
                // If we have retries left, log that we are retrying and throw the error
                // so BullMQ will schedule a retry. We keep the status as 'pending' (or whatever it was)
                // effectively by not setting it to 'failed' yet.
                await addLog(orderId, 'pending', `Retrying order (Attempt ${currentAttempt + 1}/${maxAttempts})...`);
                throw error;
            } else {
                // No retries left, mark as failed
                await addLog(orderId, 'failed', 'Transaction failed after max retries', { error: (error as Error).message });
                throw error;
            }
        }
    },
    {
        connection,
        concurrency: 3,
    }
);

orderWorker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
});

orderWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err);
});

console.log('[Worker] Order worker started and waiting for jobs...');
