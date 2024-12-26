import { useEffect, useState } from 'react';

const QRCodeDisplay = () => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8098'); // Ensure the correct WebSocket URL

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (message) => {
            try {
                console.log('Received message:', message.data); 
                const parsedMessage = JSON.parse(message.data);
                
                if (parsedMessage && parsedMessage.qrCode) {
                    setQrCodeUrl(parsedMessage.qrCode); 
                    console.log('Received QR code URL:', parsedMessage.qrCode);
                } else {
                    setError('QR code not found in message');
                    console.error('QR code not found in message:', parsedMessage);
                }
            } catch (error) {
                setError('Error parsing WebSocket message');
                console.error('Error parsing message:', error);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            setError('WebSocket error');
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
            console.log('WebSocket connection closed');
        };
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Scan the QR Code to Connect WhatsApp</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>} 
            {qrCodeUrl ? (
                <img
                    src={qrCodeUrl}
                    alt="WhatsApp QR Code"
                    style={{ width: '300px', height: '300px' }}
                />
            ) : (
                <p>Loading QR code...</p>
            )}
        </div>
    );
};

export default QRCodeDisplay;
