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

export interface LogEntry {
    timestamp: string;
    status: OrderStatus;
    message: string;
    details?: any;
}

export interface Order {
    id: string;
    tokenPair: string;
    amount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    txHash: string | null;
    bestQuote: any;
    logs: LogEntry[];
}
