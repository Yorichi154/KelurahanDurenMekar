import { execSync } from 'child_process';
import { createServer } from 'http';

// Auto install ws if missing
try {
    await import('ws');
} catch (e) {
    console.log("ws module missing, installing...");
    try {
        execSync('npm install ws', { stdio: 'inherit' });
        console.log("ws module installed successfully.");
    } catch (err) {
        console.error("Gagal install ws, pastikan koneksi internet tersedia.", err);
    }
}

let WebSocketServer;
try {
    const wsModule = await import('ws');
    WebSocketServer = wsModule.WebSocketServer;
} catch (e) {
    console.error("Gagal mengimpor ws, server akan berjalan dengan fallback http polling.");
    process.exit(1);
}

const server = createServer((req, res) => {
    res.writeHead(200);
    res.end("Chat WebSocket Server Running\n");
});

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
    console.log("Client connected");
    
    ws.on('message', (message) => {
        console.log("Broadcast message:", message.toString());
        // Broadcast to all other connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === 1) { // 1 is OPEN
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log("Client disconnected");
    });
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

const PORT = 8085;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`WebSocket server is listening on ws://127.0.0.1:${PORT}`);
});
