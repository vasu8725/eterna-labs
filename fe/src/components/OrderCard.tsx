import React from 'react';
import { LogsList } from './LogsList';
import { OrderDetails } from './OrderDetails';

interface LogEntry {
    timestamp: string;
    status: string;
    message: string;
    details?: any;
}

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

interface OrderCardProps {
    order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return '#4caf50';
            case 'failed': return '#f44336';
            case 'pending': return '#ff9800';
            case 'routing':
            case 'building':
            case 'signing':
            case 'sending': return '#2196f3';
            default: return '#9e9e9e';
        }
    };

    // Determine if order is still processing
    const isProcessing = ['pending', 'routing', 'building', 'signing', 'sending'].includes(order.status);

    return (
        <div style={{
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '0.5rem',
            backgroundColor: '#1a1a1a'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <strong style={{ fontSize: '1.1rem' }}>{order.tokenPair}</strong>
                    <span style={{ marginLeft: '0.75rem', color: '#888' }}>Amount: {order.amount}</span>
                </div>
                <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '16px',
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                }}>
                    {order.status.toUpperCase()}
                </div>
            </div>

            {/* Body - Switch between logs and details based on status */}
            {isProcessing ? (
                <>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#888', fontWeight: 'bold' }}>
                        PROCESSING LOGS:
                    </div>
                    <LogsList logs={order.logs || []} />
                </>
            ) : (
                <>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#888', fontWeight: 'bold' }}>
                        ORDER DETAILS:
                    </div>
                    <OrderDetails order={order} />
                </>
            )}
        </div>
    );
};
