import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { DexRouter } from '../dexRouter';
import { OrderJobData } from './orderQueue';
import { broadcastOrderUpdate } from '../websocket/manager';
import { OrderStatus } from '../types';

const prisma = new PrismaClient();
const dexRouter = new DexRouter();

const connection = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    tls: {
        rejectUnauthorized: false
    }
});

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

    broadcastOrderUpdate(updatedOrder);
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
            await addLog(orderId, 'failed', 'Transaction failed', { error: (error as Error).message });
            throw error;
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
