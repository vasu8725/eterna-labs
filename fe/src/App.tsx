import { useState, useEffect, useRef } from 'react'
import { OrderForm } from './components/OrderForm'
import { OrderHistory } from './components/OrderHistory'
import './index.css'

// Environment variables with fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

interface Order {
    id: string;
    tokenPair: string;
    amount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    txHash?: string | null;
    bestQuote?: any;
    logs?: LogEntry[];
}

interface LogEntry {
    timestamp: string;
    status: string;
    message: string;
    details?: any;
}

function App() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Fetch all orders on mount
        fetchOrders();

        // Connect to WebSocket for real-time updates
        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/api/orders`);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const connectWebSocket = () => {
        const ws = new WebSocket(`${WS_URL}/`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[Frontend] Connected to WebSocket for order updates');
        };

        ws.onmessage = (event) => {
            console.log('[Frontend] WebSocket message received:', event.data);
            const message = JSON.parse(event.data);
            console.log('[Frontend] Parsed message:', message);

            if (message.type === 'order-update') {
                const updatedOrder = message.data;
                console.log(`[Frontend] Order update: ${updatedOrder.id}, status: ${updatedOrder.status}, logs: ${updatedOrder.logs?.length || 0}`);
                console.log('[Frontend] Order logs:', updatedOrder.logs);

                setOrders(prevOrders => {
                    const existingIndex = prevOrders.findIndex(o => o.id === updatedOrder.id);
                    if (existingIndex >= 0) {
                        // Update existing order
                        const newOrders = [...prevOrders];
                        newOrders[existingIndex] = updatedOrder;
                        return newOrders;
                    } else {
                        // Add new order at the beginning
                        return [updatedOrder, ...prevOrders];
                    }
                });
            }
        };

        ws.onerror = (error) => {
            console.error('[Frontend] WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('[Frontend] WebSocket connection closed');
            // Reconnect after 3 seconds
            setTimeout(connectWebSocket, 3000);
        };
    };

    const handleOrderSubmit = async (tokenPair: string, amount: number) => {
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/orders/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tokenPair, amount }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit order');
            }

            const order: Order = await response.json();
            console.log('Order created:', order.id);

            // Order will be added to list via WebSocket update
            setIsLoading(false);

        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            alert('Failed to submit order. Please try again.');
        }
    };

    return (
        <div className="flex w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 overflow-hidden">
            <div className="w-1/2 p-8 flex flex-col justify-center">
                <div className="max-w-xl mx-auto w-full">
                    <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Order Execution Engine
                    </h1>
                    <p className="text-gray-400 mb-8 text-lg">
                        Submit orders and watch them process in real-time
                    </p>
                    <OrderForm onSubmit={handleOrderSubmit} isLoading={isLoading} />
                </div>
            </div>
            <div className="w-1/2 bg-gray-900/50 border-l border-gray-800">
                <OrderHistory orders={orders} />
            </div>
        </div>
    )
}

export default App
