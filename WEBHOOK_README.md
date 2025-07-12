# Payment Webhook Implementation

This implementation provides a complete webhook system for handling payment updates from OneGateway payment gateway.

## 🚀 Features

### Core Functionality
- ✅ **Webhook Processing**: Handles incoming webhook data from OneGateway
- ✅ **Duplicate Prevention**: Prevents processing the same webhook multiple times
- ✅ **Transaction Updates**: Updates existing transactions with webhook data
- ✅ **Wallet Updates**: Automatically adds funds to user wallet on successful payments
- ✅ **Raw Response Storage**: Stores complete webhook response for debugging
- ✅ **Security**: Optional signature verification for enhanced security
- ✅ **Logging**: Comprehensive logging of all webhook requests
- ✅ **Admin Interface**: Endpoints to view webhook history and details

### Database Models

#### Webhook Model (`src/model/Webhook.ts`)
Stores raw webhook responses with the following fields:
- `orderId`: OneGateway order ID
- `txnId`: Transaction ID from gateway
- `amount`: Payment amount
- `scannerIncluded`: Whether scanner was included
- `customerName`: Customer name
- `customerEmail`: Customer email
- `customerNumber`: Customer phone number
- `paymentNote`: Payment note
- `redirectUrl`: Redirect URL
- `utr`: UTR number
- `payerUpi`: Payer UPI ID
- `status`: Payment status (success/failed/pending)
- `udf1`, `udf2`, `udf3`: User-defined fields
- `rawResponse`: Complete raw webhook response
- `processed`: Whether webhook has been processed

#### Transaction Model Updates (`src/model/Transaction.ts`)
Enhanced with additional fields:
- `txnId`: Transaction ID from gateway
- `utr`: UTR number
- `payerUpi`: Payer UPI ID
- Enhanced `gatewayResponse` storage

## 📡 API Endpoints

### Webhook Endpoint
```
POST /api/v1/webhook/payment
```

**Headers:**
- `Content-Type: application/json`
- `x-webhook-signature` (optional, for security)

**Request Body:**
```json
{
  "orderId": "78676878667",
  "txnId": "orderw4jpmxhaw7cwjrxsgue4apqzr926qr",
  "amount": 200,
  "scannerIncluded": true,
  "customerName": "John Doe",
  "customerEmail": "johndoe@gmail.com",
  "customerNumber": 7099200828,
  "paymentNote": "OneGateway",
  "redirectUrl": "https://www.onegateway.in/invoice",
  "utr": "425367561874",
  "payerUpi": "onegateway@yesbank",
  "status": "success",
  "udf1": null,
  "udf2": null,
  "udf3": null
}
```

### Admin Endpoints

#### Get Webhook History
```
GET /api/v1/webhook/history
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (success/failed/pending)
- `processed`: Filter by processed status (true/false)

#### Get Specific Webhook
```
GET /api/v1/webhook/:webhookId
```
**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

## 🔧 Implementation Details

### Webhook Controller (`src/controller/webhookController.ts`)
- **handlePaymentWebhook**: Main webhook processing function
- **getWebhookHistory**: Admin function to view webhook history
- **getWebhookById**: Admin function to view specific webhook

### Security Middleware (`src/middlewares/webhookAuth.ts`)
- **verifyWebhookSignature**: HMAC signature verification
- **logWebhookRequest**: Comprehensive request logging

### Routes (`src/routes/allroutes/webhook.ts`)
- Public webhook endpoint (no authentication required)
- Admin endpoints (require JWT authentication)

## 🛡️ Security Features

### Signature Verification
The webhook supports HMAC signature verification for enhanced security:

```javascript
// Generate signature
const payload = JSON.stringify(webhookData);
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

// Send with signature
headers: {
  'Content-Type': 'application/json',
  'x-webhook-signature': signature
}
```

### Environment Variables
Set the following environment variable for production:
```bash
WEBHOOK_SECRET=your-secure-webhook-secret
```

## 🧪 Testing

### Using the Test Script
```bash
# Install dependencies
npm install

# Run the test script
node test-webhook.js
```

### Manual Testing with cURL
```bash
# Test successful payment
curl -X POST http://localhost:3000/api/v1/webhook/payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "78676878667",
    "txnId": "orderw4jpmxhaw7cwjrxsgue4apqzr926qr",
    "amount": 200,
    "scannerIncluded": true,
    "customerName": "John Doe",
    "customerEmail": "johndoe@gmail.com",
    "customerNumber": 7099200828,
    "paymentNote": "OneGateway",
    "redirectUrl": "https://www.onegateway.in/invoice",
    "utr": "425367561874",
    "payerUpi": "onegateway@yesbank",
    "status": "success",
    "udf1": null,
    "udf2": null,
    "udf3": null
  }'
```

## 📊 Database Indexes

The webhook model includes optimized indexes for better performance:
- `orderId`: For quick transaction lookups
- `txnId`: For duplicate prevention
- `status`: For status-based queries
- `processed`: For processing status queries
- `createdAt`: For chronological sorting

## 🔄 Processing Flow

1. **Webhook Received**: OneGateway sends webhook to `/api/v1/webhook/payment`
2. **Validation**: Validates required fields and status values
3. **Duplicate Check**: Prevents processing the same webhook multiple times
4. **Raw Storage**: Saves complete webhook response to database
5. **Transaction Update**: Finds and updates corresponding transaction
6. **Wallet Update**: If successful, adds funds to user's wallet
7. **Mark Processed**: Updates webhook as processed

## 🚨 Error Handling

The webhook system handles various error scenarios:
- **Missing Required Fields**: Returns 400 Bad Request
- **Invalid Status**: Returns 400 Bad Request
- **Transaction Not Found**: Logs warning but still saves webhook
- **Duplicate Webhook**: Returns 200 OK with "already processed" message
- **Server Errors**: Returns 500 Internal Server Error

## 📝 Logging

The system provides comprehensive logging:
- All incoming webhook requests
- Processing status and results
- Error conditions and stack traces
- Wallet update confirmations

## 🔧 Configuration

### Development
- Webhook signature verification is optional
- Detailed logging enabled
- No IP restrictions

### Production
- Enable webhook signature verification
- Set `WEBHOOK_SECRET` environment variable
- Consider IP whitelisting for OneGateway
- Implement rate limiting
- Monitor webhook processing logs

## 📈 Monitoring

Monitor the following metrics:
- Webhook processing success rate
- Transaction update success rate
- Wallet update success rate
- Processing time for webhooks
- Error rates and types

## 🔍 Troubleshooting

### Common Issues

1. **Webhook not processed**
   - Check if transaction exists with matching `orderId`
   - Verify webhook payload format
   - Check server logs for errors

2. **Wallet not updated**
   - Verify webhook status is "success"
   - Check if user exists and is active
   - Review `addToWallet` method logs

3. **Duplicate webhooks**
   - Check `orderId` and `txnId` combination
   - Review webhook processing logs

### Debug Commands

```bash
# Check webhook history
curl -X GET http://localhost:3000/api/v1/webhook/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check specific webhook
curl -X GET http://localhost:3000/api/v1/webhook/WEBHOOK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 Additional Resources

- [test-webhook.md](./test-webhook.md): Detailed testing guide
- [test-webhook.js](./test-webhook.js): Automated test script
- [OneGateway Documentation](https://onegateway.in/docs): Payment gateway documentation 