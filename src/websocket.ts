import WebSocket, { WebSocketServer } from 'ws';


interface QRCodeData {
    qrCode: string;
}

let currentQRCode: QRCodeData | null = null;

// Create a WebSocket server
const port = 8090;
const wss = new WebSocketServer({ port: port });

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected.');



    // Send the current QR code to the client if it exists
    if (currentQRCode) {
        ws.send(JSON.stringify({ type: 'qrCode', data: currentQRCode.qrCode }));
    }

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

// Function to simulate QR code changes
function updateQRCode(newQRCode: string) {
    currentQRCode = { qrCode: newQRCode };

    // Broadcast the new QR code to all connected clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'qrCode', data: newQRCode }));
        }
    });

    console.log('QR code updated:', newQRCode);
}

// Simulate QR code updates every 10 seconds (replace with your actual logic)
setInterval(() => {
    const randomQRCode = `QR-${Math.floor(Math.random() * 10000)}`;
    updateQRCode(randomQRCode);
}, 10000);

console.log(`WebSocket server is running on ws://localhost:${port}`);
