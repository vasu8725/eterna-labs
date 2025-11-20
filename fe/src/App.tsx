import { useState, useEffect, useRef } from 'react'
import { OrderForm } from './components/OrderForm'
import { StatusLog } from './components/StatusLog'
import './index.css'

interface Order {
    id: string;
    status: string;
    bestQuote?: {
        dex: string;
        price: number;
    };
    txHash?: string;
}

function App() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const handleOrderSubmit = async (tokenPair: string, amount: number) => {
        setIsLoading(true);
        setLogs([]);
        addLog(`Submitting order: ${tokenPair} Amount: ${amount}`);

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
            addLog(`Order created. ID: ${order.id}`);
            addLog(`Status: ${order.status}`);

            // Connect to WebSocket
            connectWebSocket(order.id);

        } catch (error) {
            addLog(`Error: ${(error as Error).message}`);
            setIsLoading(false);
        }
    };

    const connectWebSocket = (orderId: string) => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket(`ws://localhost:3000?orderId=${orderId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            addLog('Connected to WebSocket updates');
        };

        ws.onmessage = (event) => {
            const order: Order = JSON.parse(event.data);
            let message = `Status update: ${order.status}`;

            if (order.status === 'routing' && order.bestQuote) {
                message += ` | Best Quote: ${order.bestQuote.dex} @ ${order.bestQuote.price.toFixed(2)}`;
            }

            if (order.status === 'confirmed' && order.txHash) {
                message += ` | TxHash: ${order.txHash}`;
                setIsLoading(false);
            }

            if (order.status === 'failed') {
                setIsLoading(false);
            }

            addLog(message);
        };

        ws.onerror = () => {
            addLog('WebSocket error');
            setIsLoading(false);
        };

        ws.onclose = () => {
            addLog('WebSocket connection closed');
        };
    };

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Order Execution Engine</h1>
            <OrderForm onSubmit={handleOrderSubmit} isLoading={isLoading} />
            <StatusLog logs={logs} />
        </div>
    )
}

export default App
