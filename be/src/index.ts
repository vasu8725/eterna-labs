import 'dotenv/config';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { OrderManager } from './orderManager';
import { registerClient, broadcastOrderUpdate } from './websocket/manager';

const fastify = Fastify({
    logger: true
});

const orderManager = new OrderManager();

fastify.register(cors, {
    origin: '*'
});

fastify.register(websocket);

// WebSocket route for workers (internal communication)
fastify.register(async function (fastify) {
    fastify.get('/worker', { websocket: true }, (connection, req) => {
        console.log('[Server] Worker connected');

        connection.socket.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.type === 'order-update') {
                    // Broadcast order update to all clients
                    broadcastOrderUpdate(data.order);
                }
            } catch (error) {
                console.error('[Server] Error parsing worker message:', error);
            }
        });

        connection.socket.on('close', () => {
            console.log('[Server] Worker disconnected');
        });
    });
});

// WebSocket route for clients (frontend connections)
fastify.register(async function (fastify) {
    fastify.get('/', { websocket: true }, (connection, req) => {
        const query = req.query as { orderId?: string };
        const orderId = query.orderId || null;

        registerClient(orderId, connection.socket);

        connection.socket.on('close', () => {
            // Cleanup handled in registerClient
        });
    });
});

fastify.post('/api/orders/execute', async (request, reply) => {
    const { tokenPair, amount } = request.body as { tokenPair: string, amount: number };

    if (!tokenPair || !amount) {
        return reply.code(400).send({ error: 'Missing tokenPair or amount' });
    }

    const order = await orderManager.createOrder(tokenPair, Number(amount));
    return order;
});

fastify.get('/api/orders', async (request, reply) => {
    const orders = await orderManager.getAllOrders();
    return orders;
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
