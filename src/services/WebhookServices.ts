import axios from 'axios'
// WebhookService class definition
class WebhookService {
    private webhookUrl: string;

    constructor(webhookUrl: string) {
        this.webhookUrl = webhookUrl;
    }

    async send(sessionId: string, phoneNumber: string, message: any): Promise<void> {
        try {
            await axios.post("http://localhost:8000/api/v1/webhook/whatsapp", {
                sessionId,
                phoneNumber,
                message
            });
            console.log(`Webhook sent successfully for session: ${sessionId}`);
        } catch (error) {
            console.error(`Failed to send webhook for session ${sessionId}:`, (error as Error).message);
        }
    }
}
export default WebhookService