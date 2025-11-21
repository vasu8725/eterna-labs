# Eterna Labs - Order Execution Engine

A production-ready, scalable order execution engine built with TypeScript, featuring real-time updates, intelligent DEX routing, and robust queue management.

## 🔗 Deployment Links

- **Frontend (Deployed on Vercel)**: [Frontend Deployment](https://eterna-labs-ten.vercel.app/)
- **Backend API (Deployed on Render)**: [Backend Deployment](https://eterna-labs-be.onrender.com/api/orders)

## 🎥 Video Demo

**Watch the full demonstration:**

`[video demo link here - YouTube, Loom, or direct video file]`

### Demo Highlights:
- Order submission and execution flow
- Real-time log streaming
- DEX price comparison (Raydium vs Meteora)
- Retry mechanism in action
- WebSocket real-time updates
- Complete order lifecycle (Pending → Confirmed)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Performance Characteristics](#performance-characteristics)

---

## 🎯 Overview

The Order Execution Engine is a comprehensive system that simulates token trading on Solana DEXs (Raydium & Meteora). It provides real-time order tracking, intelligent price comparison, retry mechanisms, and a modern UI for monitoring order execution.

### End-to-End Order Journey

```
1. User submits order (Token Pair + Amount) via Frontend
   ↓
2. Backend API creates order in PostgreSQL database
   ↓
3. Order job added to Redis-backed BullMQ queue
   ↓
4. Worker picks up job and begins processing:
   • Pending → Fetches best quote from DEX Router
   • Routing → Compares Raydium vs Meteora prices
   • Building → Creates transaction
   • Signing → Signs transaction
   • Sending → Submits to network
   • Confirmed → Transaction successful
   ↓
5. Worker publishes updates to Redis Pub/Sub
   ↓
6. Backend server receives updates and broadcasts to Frontend via WebSocket
   ↓
7. Frontend displays real-time logs to user
```

---

## 🏗️ Architecture

### System Architecture Diagram

<img width="1743" height="787" alt="eterna-labs-architechture" src="https://github.com/user-attachments/assets/76a85a75-0cd9-4048-9472-f600270dd814" />

### Communication Flow

1. **HTTP**: Frontend ↔ Backend API (Order submission & retrieval)
2. **WebSocket**: Frontend ↔ Backend (Real-time updates to clients)
3. **Redis Queue**: Backend → Worker (Job distribution)
4. **Redis Pub/Sub**: Worker → Backend (Order status updates)
5. **PostgreSQL**: Backend ↔ Database (Persistent storage)

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **TypeScript** | Type-safe development | 5.3.3 |
| **Fastify** | High-performance web framework | 4.26.1 |
| **Prisma** | ORM for PostgreSQL | 5.10.2 |
| **BullMQ** | Redis-backed job queue | 5.63.2 |
| **Redis (ioredis)** | Queue & Pub/Sub messaging | 5.8.2 |
| **WebSocket (ws)** | Real-time client communication | 8.18.3 |
| **Jest** | Testing framework | Latest |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React** | UI framework |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Vite** | Build tool |

### Infrastructure

- **PostgreSQL**: Order persistence
- **Redis**: Queue management & Pub/Sub messaging
- **Node.js**: Runtime environment

---

## ✨ Features

### 1. **Intelligent DEX Routing** ✅
- Compares prices between Raydium and Meteora DEXs
- Automatically selects best price for user
- Simulates network delays for realistic behavior

### 2. **Robust Queue System** ✅
- Redis-backed BullMQ for job management
- Concurrent processing (3 workers)
- Automatic job distribution and scaling

### 3. **Retry Mechanism with Logging** ✅
- Automatic retry on failure (up to 3 attempts)
- Detailed logs for each retry attempt
- Exponential backoff strategy
- Final failure notification after max retries

### 4. **Real-time Order Tracking** ✅
- WebSocket-based live updates
- Detailed execution logs at each stage:
  - Pending
  - Routing (DEX price comparison)
  - Building transaction
  - Signing transaction
  - Sending to network
  - Confirmed/Failed

### 5. **Redis Pub/Sub Architecture** ✅
- Decoupled worker-to-server communication
- Scalable messaging layer
- Single Redis instance for queue + messaging
- Workers publish updates via Pub/Sub
- Server subscribes and broadcasts to clients

### 6. **Comprehensive Testing** ✅
- Unit tests for routing logic
- Integration tests for queue behavior
- WebSocket lifecycle tests
- End-to-end flow tests
- 7 passing tests across 4 test suites

### 7. **Modern UI/UX** ✅
- Two-column layout (Form + History)
- Real-time log streaming
- Auto-scroll to latest logs
- Tailwind CSS styling
- Responsive design

---

### Database Schema (Prisma)

```prisma
model Order {
  id         String   @id @default(uuid())
  tokenPair  String
  amount     Float
  status     String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  txHash     String?
  bestQuote  Json?
  logs       Json?
}
```

### Order Lifecycle States

1. **pending**: Order received and queued
2. **routing**: Comparing DEX prices
3. **building**: Creating transaction
4. **signing**: Signing transaction
5. **sending**: Submitting to network
6. **confirmed**: Transaction successful ✅
7. **failed**: Transaction failed ❌

---

## 📡 API Endpoints

### REST API

#### `POST /api/orders/execute`
Execute a new order

**Request Body:**
```json
{
  "tokenPair": "SOL-USDC",
  "amount": 10
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "tokenPair": "SOL-USDC",
  "amount": 10,
  "status": "pending",
  "createdAt": "2025-11-20T...",
  "updatedAt": "2025-11-20T...",
  "txHash": null,
  "bestQuote": null,
  "logs": []
}
```

#### `GET /api/orders`
Retrieve all orders

**Response:**
```json
[
  {
    "id": "uuid-1",
    "tokenPair": "SOL-USDC",
    "amount": 10,
    "status": "confirmed",
    "txHash": "0x...",
    "bestQuote": {
      "dex": "Raydium",
      "price": 102.45,
      "fee": 0.003
    },
    "logs": [...]
  }
]
```

### WebSocket API

#### `WS /`
Real-time order updates

**Query Parameters:**
- `orderId` (optional): Subscribe to specific order updates

**Message Format:**
```json
{
  "type": "order-update",
  "data": {
    "id": "order-id",
    "status": "routing",
    "logs": [
      {
        "timestamp": "2025-11-20T...",
        "status": "routing",
        "message": "Comparing DEX prices",
        "details": null
      }
    ]
  }
}
```

---

## 🧪 Testing

### Test Structure

```
tests/
├── routing.test.ts      # DEX routing logic (2 tests)
├── queue.test.ts        # BullMQ queue behavior (1 test)
├── websocket.test.ts    # WebSocket lifecycle (3 tests)
└── integration.test.ts  # End-to-end flow (1 test)
```

### Test Coverage

| Category | Tests | Description |
|----------|-------|-------------|
| **Routing Logic** | 2 | DEX price comparison, token pair handling |
| **Queue Behavior** | 1 | Job addition with correct options |
| **WebSocket** | 3 | Client registration, broadcasts, cleanup |
| **Integration** | 1 | Full order lifecycle simulation |
| **Total** | **7** | All passing ✅ |

### Running Tests

```bash
cd be
npm test
```

**Expected Output:**
```
Test Suites: 4 passed, 4 total
Tests:       7 passed, 7 total
Time:        ~11s
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Backend Setup

```bash
# Navigate to backend directory
cd be

# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma generate

# Start server
npm run dev

# Start worker (in separate terminal)
npm run worker
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd fe

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔐 Environment Variables

### Backend (`be/.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/orders_db"

# Redis (Queue & Pub/Sub)
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
```

### Frontend (`fe/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

---

## 📁 Project Structure

```
eterna-labs/
├── be/                          # Backend
│   ├── src/
│   │   ├── queue/
│   │   │   ├── orderQueue.ts    # BullMQ queue setup
│   │   │   └── orderWorker.ts   # Job processor
│   │   ├── redis/
│   │   │   └── pubsub.ts        # Redis Pub/Sub service
│   │   ├── websocket/
│   │   │   └── manager.ts       # WebSocket client manager
│   │   ├── dexRouter.ts         # DEX price comparison
│   │   ├── orderManager.ts      # Order business logic
│   │   ├── types.ts             # TypeScript types
│   │   ├── index.ts             # Main server
│   │   └── worker.ts            # Worker entry point
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── package.json
├── fe/                          # Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderForm.tsx
│   │   │   ├── OrderHistory.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   └── LogsList.tsx
│   │   └── App.tsx
│   └── package.json
├── tests/                       # Tests
│   ├── routing.test.ts
│   ├── queue.test.ts
│   ├── websocket.test.ts
│   └── integration.test.ts
└── README.md
```

---

## 📊 Performance Characteristics

- **Concurrent Orders**: 3 simultaneous workers
- **Retry Strategy**: Exponential backoff (1s, 2s, 4s)
- **Queue Throughput**: ~100 jobs/minute per worker
- **WebSocket Latency**: <100ms for updates
- **Database**: Indexed queries on order ID
