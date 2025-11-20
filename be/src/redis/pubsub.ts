import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || '';

// Publisher instance (for workers)
const publisher = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    tls: {
        rejectUnauthorized: false
    }
});

// Subscriber instance (for server)
const subscriber = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    tls: {
        rejectUnauthorized: false
    }
});

const CHANNEL_NAME = 'order-updates';

/**
 * Publish an order update to the Redis pub/sub channel
 * Used by workers to send updates to the server
 */
export async function publishOrderUpdate(order: any): Promise<void> {
    try {
        await publisher.publish(CHANNEL_NAME, JSON.stringify({
            type: 'order-update',
            order
        }));
        console.log(`[PubSub] Published update for order ${order.id}`);
    } catch (error) {
        console.error('[PubSub] Error publishing order update:', error);
    }
}

/**
 * Subscribe to order updates from the Redis pub/sub channel
 * Used by the server to receive updates from workers
 */
export function subscribeToOrderUpdates(callback: (order: any) => void): void {
    subscriber.subscribe(CHANNEL_NAME, (err, count) => {
        if (err) {
            console.error('[PubSub] Failed to subscribe:', err);
            return;
        }
        console.log(`[PubSub] Subscribed to ${CHANNEL_NAME} channel (${count} subscriptions active)`);
    });

    subscriber.on('message', (channel, message) => {
        if (channel === CHANNEL_NAME) {
            try {
                const data = JSON.parse(message);
                if (data.type === 'order-update') {
                    callback(data.order);
                }
            } catch (error) {
                console.error('[PubSub] Error parsing message:', error);
            }
        }
    });

    subscriber.on('error', (error) => {
        console.error('[PubSub] Subscriber error:', error);
    });
}
