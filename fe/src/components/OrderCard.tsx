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
            case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'routing':
            case 'building':
            case 'signing':
            case 'sending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    // Determine if order is still processing
    const isProcessing = ['pending', 'routing', 'building', 'signing', 'sending'].includes(order.status);

    return (
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 mb-4 hover:bg-gray-800/60 transition-all duration-200 shadow-lg hover:shadow-xl hover:border-gray-600/50 group">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <strong className="text-lg text-white font-bold tracking-wide">{order.tokenPair}</strong>
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-medium px-2 py-0.5 rounded bg-gray-900/50 border border-gray-800">
                            Limit Order
                        </span>
                    </div>
                    <span className="text-gray-400 text-sm mt-1 font-medium">Amount: <span className="text-gray-300">{order.amount}</span></span>
                </div>
                <div className={`
                    px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm
                    ${getStatusColor(order.status)}
                `}>
                    {order.status}
                </div>
            </div>

            {/* Body - Switch between logs and details based on status */}
            <div className="bg-gray-900/30 rounded-lg p-1 border border-gray-800/50">
                {isProcessing ? (
                    <div className="p-2">
                        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-blue-400 uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Processing Logs
                        </div>
                        <LogsList logs={order.logs || []} />
                    </div>
                ) : (
                    <div className="p-2">
                        <div className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Order Details
                        </div>
                        <OrderDetails order={order} />
                    </div>
                )}
            </div>
        </div>
    );
};
