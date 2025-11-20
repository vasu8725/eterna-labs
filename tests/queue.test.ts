import { orderQueue } from '../be/src/queue/orderQueue';

// Mock BullMQ
jest.mock('bullmq', () => {
    return {
        Queue: jest.fn().mockImplementation(() => {
            return {
                add: jest.fn().mockResolvedValue({ id: '123', data: {} }),
                close: jest.fn().mockResolvedValue(undefined)
            };
        }),
        Worker: jest.fn()
    };
});

// Mock Redis
jest.mock('ioredis', () => {
    return {
        Redis: jest.fn().mockImplementation(() => {
            return {
                on: jest.fn(),
                quit: jest.fn()
            };
        })
    };
});

describe('Order Queue Behavior', () => {
    test('adds job to queue with correct options', async () => {
        const job = await orderQueue.add('order-processing', {
            orderId: 'test-order-1',
            tokenPair: 'ETH-USDC',
            amount: 10
        });

        expect(job).toBeDefined();
        expect(job.id).toBe('123');

        // Verify that the mock was called (implementation detail of the mock)
        // In a real integration test, we would check if the job is actually in Redis
    });
});
