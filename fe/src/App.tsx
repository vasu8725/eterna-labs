import { useState, useEffect, useRef } from 'react'
import { OrderForm } from './components/OrderForm'
import { OrderHistory } from './components/OrderHistory'
import './index.css'

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
            const response = await fetch('http://localhost:3000/api/orders');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const connectWebSocket = () => {
        const ws = new WebSocket('ws://localhost:3000/');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to WebSocket for order updates');
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'order-update') {
                const updatedOrder = message.data;

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
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            // Reconnect after 3 seconds
            setTimeout(connectWebSocket, 3000);
        };
    };

    const handleOrderSubmit = async (tokenPair: string, amount: number) => {
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/orders/execute', {
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
        <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <div style={{ width: '50%', padding: '2rem' }}>
                <h1>Order Execution Engine</h1>
                <p style={{ color: '#888' }}>Submit orders and watch them process in real-time</p>
                <OrderForm onSubmit={handleOrderSubmit} isLoading={isLoading} />
            </div>
            <div style={{ width: '50%' }}>
                <OrderHistory orders={orders} />
            </div>
        </div>
    )
}

export default App
