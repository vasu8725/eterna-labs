import React, { useState } from 'react';

interface OrderFormProps {
    onSubmit: (tokenPair: string, amount: number) => void;
    isLoading: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, isLoading }) => {
    const [tokenPair, setTokenPair] = useState('SOL/USDC');
    const [amount, setAmount] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(tokenPair, amount);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Token Pair</label>
                <input
                    type="text"
                    value={tokenPair}
                    onChange={(e) => setTokenPair(e.target.value)}
                    style={{ padding: '0.5rem', width: '100%' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{ padding: '0.5rem', width: '100%' }}
                />
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Execute Order'}
            </button>
        </form>
    );
};
