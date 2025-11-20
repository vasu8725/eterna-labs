import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    tls: {
        rejectUnauthorized: false
    }
});

export const orderQueue = new Queue('order-processing', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: 100,
        removeOnFail: 200
    }
});

export interface OrderJobData {
    orderId: string;
    tokenPair: string;
    amount: number;
}
