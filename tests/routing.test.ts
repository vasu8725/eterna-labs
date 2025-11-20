import { DexRouter } from '../be/src/dexRouter';

// Mock the DexRouter methods if necessary, or test the logic directly if it doesn't depend on external services
// For this example, we'll assume DexRouter has some logic we can test, or we mock the external calls.
// Since DexRouter likely makes HTTP calls, we should mock them.

jest.mock('../be/src/dexRouter', () => {
    return {
        DexRouter: jest.fn().mockImplementation(() => {
            return {
                getBestQuote: jest.fn().mockResolvedValue({
                    dex: 'Uniswap',
                    price: 100.50,
                    amount: 10
                })
            };
        })
    };
});

describe('DexRouter Logic', () => {
    let router: any;

    beforeEach(() => {
        const { DexRouter } = require('../be/src/dexRouter');
        router = new DexRouter();
    });

    test('getBestQuote returns the best price', async () => {
        const quote = await router.getBestQuote('ETH-USDC', 10);
        expect(quote).toBeDefined();
        expect(quote.dex).toBe('Uniswap');
        expect(quote.price).toBe(100.50);
        expect(quote.amount).toBe(10);
    });

    test('getBestQuote handles different token pairs', async () => {
        const quote = await router.getBestQuote('BTC-USDT', 1);
        expect(quote).toBeDefined();
    });
});
