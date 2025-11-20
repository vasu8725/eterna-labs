import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    roots: ['<rootDir>', '<rootDir>/../tests'],
    testMatch: ['**/*.test.ts'],
    moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};

export default config;
