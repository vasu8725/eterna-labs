import React from 'react';

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

interface OrderDetailsProps {
    order: Order;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Ideally show a toast here, but for now just copy
    };

    return (
        <div className="mt-2 p-4 bg-black/20 rounded-lg border border-gray-800/50 text-sm space-y-3">
            <div className="grid grid-cols-3 gap-2 items-center group">
                <strong className="text-gray-500 font-medium">Order ID:</strong>
                <div
                    className="col-span-2 font-mono text-gray-300 hover:text-white cursor-pointer flex items-center gap-2 transition-colors"
                    onClick={() => copyToClipboard(order.id)}
                    title="Click to copy"
                >
                    {order.id.substring(0, 8)}...{order.id.substring(order.id.length - 6)}
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
                <strong className="text-gray-500 font-medium">Token Pair:</strong>
                <span className="col-span-2 text-white font-semibold tracking-wide">{order.tokenPair}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
                <strong className="text-gray-500 font-medium">Amount:</strong>
                <span className="col-span-2 text-white font-mono">{order.amount}</span>
            </div>

            {order.bestQuote && order.bestQuote.dex && (
                <div className="grid grid-cols-3 gap-2 items-center bg-green-500/5 p-2 -mx-2 rounded border border-green-500/10">
                    <strong className="text-green-500/70 font-medium">Best Quote:</strong>
                    <span className="col-span-2 text-green-400 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {order.bestQuote.dex} @ ${order.bestQuote.price?.toFixed(2)}
                    </span>
                </div>
            )}

            {order.txHash && (
                <div className="grid grid-cols-3 gap-2 items-center group">
                    <strong className="text-gray-500 font-medium">TxHash:</strong>
                    <div
                        className="col-span-2 font-mono text-blue-400 hover:text-blue-300 cursor-pointer truncate flex items-center gap-2 transition-colors"
                        onClick={() => copyToClipboard(order.txHash || '')}
                        title="Click to copy"
                    >
                        <span className="truncate">{order.txHash}</span>
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                </div>
            )}

            <div className="pt-2 mt-2 border-t border-gray-800/50 grid grid-cols-2 gap-4 text-xs">
                <div>
                    <div className="text-gray-600 mb-0.5">Created</div>
                    <div className="text-gray-400">{formatDateTime(order.createdAt)}</div>
                </div>
                {order.status === 'confirmed' && (
                    <div className="text-right">
                        <div className="text-gray-600 mb-0.5">Completed</div>
                        <div className="text-gray-400">{formatDateTime(order.updatedAt)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
