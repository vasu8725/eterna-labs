import React from 'react';
import { OrderCard } from './OrderCard';

interface Order {
    id: string;
    tokenPair: string;
    amount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    txHash?: string | null;
    bestQuote?: any;
}

interface OrderHistoryProps {
    orders: Order[];
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
    return (
        <div style={{
            height: 'calc(100vh - 4rem)',
            overflowY: 'auto',
            padding: '1rem',
            borderLeft: '1px solid #444'
        }}>
            <h2>Order History ({orders.length})</h2>
            {orders.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
                    No orders yet. Submit an order to get started!
                </div>
            ) : (
                orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))
            )}
        </div>
    );
};
