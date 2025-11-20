import { WebSocket } from 'ws';

const clients: Map<string, Set<WebSocket>> = new Map();
const globalClients: Set<WebSocket> = new Set();

export function registerClient(orderId: string | null, ws: WebSocket) {
    if (orderId) {
        if (!clients.has(orderId)) {
            clients.set(orderId, new Set());
        }
        clients.get(orderId)!.add(ws);
    }

    // Also add to global clients for order list updates
    globalClients.add(ws);

    ws.on('close', () => {
        if (orderId) {
            clients.get(orderId)?.delete(ws);
            if (clients.get(orderId)?.size === 0) {
                clients.delete(orderId);
            }
        }
        globalClients.delete(ws);
    });
}

export function broadcastOrderUpdate(order: any) {
    // Send to clients listening to this specific order
    const orderClients = clients.get(order.id);
    if (orderClients) {
        orderClients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'order-update', data: order }));
            }
        });
    }

    // Also broadcast to all global clients for order list updates
    globalClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'order-update', data: order }));
        }
    });
}
