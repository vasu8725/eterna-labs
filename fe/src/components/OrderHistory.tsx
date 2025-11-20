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
        <div className="h-[calc(100vh-0.5rem)] overflow-y-auto  pr-2 custom-scrollbar">
            <h2 className="text-xl font-bold mb-6 pl-3 text-gray-200 flex items-center gap-2 sticky top-0 bg-gray-900/95 backdrop-blur py-4 z-10">
                Order History
                <span className="bg-gray-800 text-gray-400 text-sm py-0.5 px-2.5 rounded-full border border-gray-700">
                    {orders.length}
                </span>
            </h2>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30">
                    <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    <p className="text-lg font-medium">No orders yet</p>
                    <p className="text-sm opacity-75 mt-1">Submit an order to get started!</p>
                </div>
            ) : (
                <div className="space-y-4 pb-4 ml-3">
                    {orders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
};
