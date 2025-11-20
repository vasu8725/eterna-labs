import { WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import { DexRouter } from './dexRouter';
import { Quote } from './types';

const prisma = new PrismaClient();

export class OrderManager {
    private clients: Map<string, WebSocket> = new Map();
    private dexRouter = new DexRouter();

    async createOrder(tokenPair: string, amount: number) {
        const order = await prisma.order.create({
            data: {
                tokenPair,
                amount,
                status: 'pending',
                bestQuote: {}, // Initialize with empty JSON or null
            }
        });

        // Start processing asynchronously
        this.processOrder(order.id, tokenPair, amount);

        return order;
    }

    async registerClient(orderId: string, ws: WebSocket) {
        this.clients.set(orderId, ws);
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order) {
            this.notifyClient(orderId, order);
        }
    }

    private async processOrder(orderId: string, tokenPair: string, amount: number) {
        try {
            // 1. Routing
            await this.updateStatus(orderId, 'routing');
            const quote = await this.dexRouter.getBestQuote(tokenPair, amount);

            await prisma.order.update({
                where: { id: orderId },
                data: { bestQuote: quote as any }
            });

            // 2. Building
            await this.simulateStep(orderId, 'building', 1500);

            // 3. Signing
            await this.simulateStep(orderId, 'signing', 1000);

            // 4. Sending
            await this.simulateStep(orderId, 'sending', 2000);

            // 5. Confirmed
            const txHash = '0x' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'confirmed',
                    txHash: txHash
                }
            });

            const finalOrder = await prisma.order.findUnique({ where: { id: orderId } });
            if (finalOrder) this.notifyClient(orderId, finalOrder);

        } catch (error) {
            console.error(error);
            await this.updateStatus(orderId, 'failed');
        }
    }

    private async simulateStep(orderId: string, status: string, delay: number) {
        await this.updateStatus(orderId, status);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    private async updateStatus(orderId: string, status: string) {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });
        this.notifyClient(orderId, order);
    }

    private notifyClient(orderId: string, order: any) {
        const ws = this.clients.get(orderId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(order));
        }
    }
}
