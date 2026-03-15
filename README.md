# RemitLand - International Money Transfer Dashboard

A full-stack transaction dashboard with real-time updates, built with **Next.js + TypeScript + TailwindCSS** (frontend) and **Laravel 10 + PHP** (backend).

## Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Frontend         | Next.js 16, React 19, TypeScript, TailwindCSS |
| State Management | Redux Toolkit                                 |
| Backend          | Laravel 10, PHP 8.2                           |
| Database         | Supabase (PostgreSQL) / SQLite for dev        |
| Caching          | Redis (file-based fallback)                   |
| Real-time        | Socket.IO (Node.js server)                    |
| Queue            | Laravel Database Queue                        |

## Project Structure

```
full-stack-test/
├── remitland-frontend/         # Next.js React app
│   └── src/
│       ├── app/                # Pages (routes)
│       ├── components/         # React components
│       ├── store/              # Redux state management
│       ├── services/           # API & Socket.IO clients
│       └── data/               # Fallback JSON data
├── remitland-backend/          # Laravel PHP API
│   ├── app/
│   │   ├── Models/             # Eloquent models
│   │   ├── Http/Controllers/   # API controllers
│   │   ├── Http/Resources/     # API response transformers
│   │   ├── Jobs/               # Queue jobs
│   │   └── Console/Commands/   # Artisan commands
│   ├── database/
│   │   ├── migrations/         # DB schema
│   │   └── seeders/            # Sample data
│   └── socket-server.cjs       # Node.js Socket.IO server
├── docker-compose.yml          # Docker deployment
├── DEPLOY_AWS.md               # AWS deployment guide
└── README.md
```

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm
- Redis (optional — app works without it)

## Setup Instructions

### 1. Backend (Laravel)

```bash
cd remitland-backend

# Install PHP dependencies
composer install

# Create SQLite database & seed sample data
touch database/database.sqlite
php artisan migrate:fresh --seed

# Start the Laravel API server
php artisan serve --port=8000
```

API available at `http://localhost:8000/api`

### 2. Frontend (Next.js)

```bash
cd remitland-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

App available at `http://localhost:3000`

### 3. Socket.IO Server (for real-time)

```bash
cd remitland-backend

# Install Socket.IO dependencies
npm install

# Start the Socket.IO server
node socket-server.cjs
```

Socket.IO server on `http://localhost:6001`

### 4. Queue Worker (for queued transactions)

```bash
cd remitland-backend

# Process queued transactions in background
php artisan queue:work

# In another terminal — queue a test transaction:
php artisan transactions:queue --currency=USD
```

### 5. Supabase (PostgreSQL) — Optional

To use Supabase instead of SQLite:

1. Create a project at [supabase.com](https://supabase.com)
2. Update `remitland-backend/.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=db.your-project.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-password
```
3. Run `php artisan migrate:fresh --seed`

## API Endpoints

| Method | Endpoint                                        | Description                                              |
| ------ | ----------------------------------------------- | -------------------------------------------------------- |
| GET    | `/api/receivers/{id}`                           | Get receiver details with currency accounts              |
| GET    | `/api/receivers/{id}/transactions?currency=USD` | Get transactions filtered by currency                    |
| PATCH  | `/api/transactions/{id}/status`                 | Update transaction status (triggers real-time broadcast)  |
| GET    | `/api/currencies`                               | List all currencies                                      |
| GET    | `/api/download`                                 | Download sample receipt file                             |

## Features

- **Receivers Page** (`/`): Single "View Receiver" CTA that opens the popup
- **Receiver Modal** (Appendix 1): Receiver info, currency tabs (AUD/USD/CAD), bank details, transactions table
- **Dashboard Page** (`/dashboard`, Appendix 2): Account balance, quick conversion, transaction list — clicking a transaction opens the popup
- **Currency Tabs**: Click any currency to load its transactions. USD selected by default
- **Persisted Currency**: Last selected currency saved to localStorage, restored when popup reopens
- **Real-time Status Updates**: Change a status in one browser → all other browsers update instantly via Socket.IO
- **Queued Transactions**: New transactions can be queued and appear in real-time when processed
- **Client-side Search**: Filter transactions by "To" field and "Status"
- **Download CTA**: Downloads a sample receipt file
- **Mobile Responsive**: Popup and dashboard fully responsive
- **Redis Caching**: API responses cached with automatic invalidation on status change

## Real-time Demo

To see real-time updates in action:

1. Start all 3 servers (Laravel, Socket.IO, Next.js)
2. Open `http://localhost:3000` in **two different browser windows**
3. Click "View Receiver" in both
4. In Window A: click the dropdown arrow (▼) next to any transaction → change status
5. Watch Window B — the status badge updates instantly

To see queued transactions appear:
1. Keep the popup open in a browser
2. In terminal: `php artisan transactions:queue --currency=USD`
3. The new transaction appears in the popup within ~2 seconds

## Architecture

### Data Flow
```
User Action → Redux Dispatch → API Call → Laravel Controller → DB → API Resource → Redux Store → UI Re-render
```

### Real-time Flow
```
User A changes status → Laravel PATCH API → HTTP POST to Socket.IO server → WebSocket broadcast → User B's Redux store → UI updates
```

### Queued Transaction Flow
```
artisan transactions:queue → Creates "Queued" transaction → Dispatches Job
Queue Worker picks up Job → Changes status to "Pending" → HTTP POST to Socket.IO → All browsers see new transaction
```

## Docker Deployment

```bash
# Set Supabase credentials
export SUPABASE_DB_HOST=db.your-project.supabase.co
export SUPABASE_DB_PASSWORD=your-password

# Build and start
docker-compose up -d --build

# Run migrations
docker-compose exec backend php artisan migrate:fresh --seed
```

See [DEPLOY_AWS.md](DEPLOY_AWS.md) for full AWS deployment instructions.
