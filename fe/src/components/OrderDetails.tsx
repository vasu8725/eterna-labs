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
    };

    return (
        <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '6px',
            border: '1px solid #333',
            fontSize: '0.9rem'
        }}>
            <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#888' }}>Order ID:</strong>
                <span style={{
                    marginLeft: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                }} onClick={() => copyToClipboard(order.id)} title="Click to copy">
                    {order.id.substring(0, 8)}...{order.id.substring(order.id.length - 6)}
                </span>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#888' }}>Token Pair:</strong>
                <span style={{ marginLeft: '0.5rem', color: '#fff' }}>{order.tokenPair}</span>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#888' }}>Amount:</strong>
                <span style={{ marginLeft: '0.5rem', color: '#fff' }}>{order.amount}</span>
            </div>

            {order.bestQuote && order.bestQuote.dex && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#888' }}>Best Quote:</strong>
                    <span style={{ marginLeft: '0.5rem', color: '#4caf50' }}>
                        {order.bestQuote.dex} @ ${order.bestQuote.price?.toFixed(2)}
                    </span>
                </div>
            )}

            {order.txHash && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#888' }}>TxHash:</strong>
                    <span style={{
                        marginLeft: '0.5rem',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        color: '#646cff',
                        cursor: 'pointer'
                    }} onClick={() => copyToClipboard(order.txHash || '')} title="Click to copy">
                        {order.txHash}
                    </span>
                </div>
            )}

            <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#888' }}>Created:</strong>
                <span style={{ marginLeft: '0.5rem', color: '#aaa', fontSize: '0.85rem' }}>
                    {formatDateTime(order.createdAt)}
                </span>
            </div>

            {order.status === 'confirmed' && (
                <div>
                    <strong style={{ color: '#888' }}>Completed:</strong>
                    <span style={{ marginLeft: '0.5rem', color: '#aaa', fontSize: '0.85rem' }}>
                        {formatDateTime(order.updatedAt)}
                    </span>
                </div>
            )}
        </div>
    );
};
