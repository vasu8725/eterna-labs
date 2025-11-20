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
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-8 w-full backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">Token Pair</label>
                <input
                    type="text"
                    value={tokenPair}
                    onChange={(e) => setTokenPair(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                    placeholder="e.g. SOL/USDC"
                />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">Amount</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className={`
                    w-full py-3.5 px-6 rounded-lg font-bold text-lg text-white shadow-lg
                    transform transition-all duration-200
                    ${isLoading
                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] hover:shadow-blue-500/25 active:scale-[0.98]'
                    }
                `}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : 'Execute Order'}
            </button>
        </form>
    );
};
