/**
 * Socket.IO Server for RemitLand
 *
 * Bridges Laravel (PHP backend) and React (browser frontend) for real-time updates.
 *
 * Handles TWO types of events from Laravel:
 * 1. "status-updated" — when a user changes a transaction's status
 * 2. "new-transaction" — when a queued transaction finishes processing
 *
 * Both are received via HTTP POST /notify from Laravel,
 * then broadcast to ALL connected browsers via WebSocket.
 *
 * Run: node socket-server.js
 */

const http = require('http');
const { Server } = require('socket.io');

// ── Create HTTP server ──
const httpServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // POST /notify — receives events from Laravel
    if (req.method === 'POST' && req.url === '/notify') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const eventType = data.event || 'status-updated';

                if (eventType === 'new-transaction') {
                    // A queued transaction has been processed — broadcast to all browsers
                    console.log(`New transaction #${data.id} (${data.currency_code}) → broadcasting`);
                    io.emit('new-transaction', data);
                } else {
                    // Status change — broadcast to all browsers
                    console.log(`Status update #${data.id}: ${data.old_status} → ${data.status}`);
                    io.emit('transaction-status-updated', data);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                console.error('Invalid JSON:', e.message);
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // Health check
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', clients: io.engine.clientsCount }));
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

// ── Socket.IO server ──
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://remitland.duckdns.org'],
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id} (total: ${io.engine.clientsCount})`);
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// ── Optional: Redis Pub/Sub ──
try {
    const Redis = require('ioredis');
    const redis = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => times > 3 ? null : Math.min(times * 200, 2000),
    });

    redis.connect()
        .then(() => {
            redis.subscribe('transactions');
            console.log('Redis connected — also listening for pub/sub events');
            redis.on('message', (channel, message) => {
                try {
                    const data = JSON.parse(message);
                    io.emit('transaction-status-updated', data);
                } catch (e) {
                    console.error('Redis parse error:', e);
                }
            });
        })
        .catch(() => console.log('Redis not available — HTTP only mode'));
} catch {
    console.log('ioredis not installed — HTTP only mode');
}

// ── Start ──
const PORT = process.env.SOCKET_PORT || 6001;
httpServer.listen(PORT, () => {
    console.log(`\nSocket.IO server running on port ${PORT}`);
    console.log(`  WebSocket:  ws://localhost:${PORT}`);
    console.log(`  HTTP notify: POST http://localhost:${PORT}/notify\n`);
});
