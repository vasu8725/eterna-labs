export type OrderStatus =
    | 'pending'
    | 'routing'
    | 'building'
    | 'signing'
    | 'sending'
    | 'confirmed'
    | 'failed';

export interface Quote {
    dex: 'Raydium' | 'Meteora';
    price: number;
    fee: number;
}

// We can use the Prisma generated type for Order, but for now let's define a compatible interface
// to avoid circular dependency issues before generation is complete.
export interface Order {
    id: string;
    tokenPair: string;
    amount: number;
    status: string; // Prisma uses string
    createdAt: Date;
    updatedAt: Date;
    txHash: string | null;
    bestQuote: any; // Json in Prisma
}
