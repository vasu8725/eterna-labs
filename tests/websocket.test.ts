import { registerClient, broadcastOrderUpdate } from '../be/src/websocket/manager';

// Mock WebSocket without importing ws
const WebSocketMock = {
    OPEN: 1
};

const mockWs = {
    on: jest.fn(),
    send: jest.fn(),
    readyState: WebSocketMock.OPEN,
    close: jest.fn()
} as any;

describe('WebSocket Lifecycle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('registers a client for a specific order', () => {
        registerClient('order-123', mockWs);
        expect(mockWs.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    test('broadcasts updates to registered clients', () => {
        registerClient('order-123', mockWs);

        const update = { id: 'order-123', status: 'pending' };
        broadcastOrderUpdate(update);

        expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
            type: 'order-update',
            data: update
        }));
    });

    test('broadcasts updates to global clients', () => {
        registerClient(null, mockWs); // Global listener

        const update = { id: 'order-456', status: 'completed' };
        broadcastOrderUpdate(update);

        expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
            type: 'order-update',
            data: update
        }));
    });
});
