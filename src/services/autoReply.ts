export async function handleAutoReply(sock: any, message: any): Promise<void> {
    const from = message.key.remoteJid; // Sender's ID
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;

    if (!text || !from) return;

    let reply = '';
    if (text === 'Hi') {
        reply = 'Hello! How can I assist you today?';
    } else if (text === 'Bye') {
        reply = 'Goodbye! Have a great day!';
    } else {
        reply = 'I am a bot. Please say "Hi" or "Bye".';
    }

    if (reply) {
        await sock.sendMessage(from, { text: reply });
    }
}
