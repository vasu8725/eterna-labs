import { PrismaClient } from '@prisma/client';
import { orderQueue, OrderJobData } from './queue/orderQueue';
import { broadcastOrderUpdate } from './websocket/manager';

const prisma = new PrismaClient();

export class OrderManager {
    async createOrder(tokenPair: string, amount: number) {
        // Create order in database
        const order = await prisma.order.create({
            data: {
                tokenPair,
                amount,
                status: 'pending',
                bestQuote: {},
                logs: [],
            }
        });

        // Broadcast the newly created order immediately
        broadcastOrderUpdate(order);

        // Enqueue job for processing
        const jobData: OrderJobData = {
            orderId: order.id,
            tokenPair,
            amount
        };

        await orderQueue.add('process-order', jobData, {
            jobId: order.id, // Use order ID as job ID for tracking
        });

        console.log(`[OrderManager] Order ${order.id} created and enqueued`);

        return order;
    }

    async getAllOrders() {
        return await prisma.order.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}
