import React, { useState } from 'react';

interface OrderFormProps {
    onSubmit: (tokenPair: string, amount: number) => void;
    isLoading: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, isLoading }) => {
    const [tokenPair, setTokenPair] = useState('SOL/USDC');
    const [amount, setAmount] = useState(10);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(tokenPair, amount);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', marginTop: '2rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Token Pair</label>
                <input
                    type="text"
                    value={tokenPair}
                    onChange={(e) => setTokenPair(e.target.value)}
                    style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Amount</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: 'white' }}
                />
            </div>
            <button type="submit" disabled={isLoading} style={{
                padding: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
            }}>
                {isLoading ? 'Processing...' : 'Execute Order'}
            </button>
        </form>
    );
};
