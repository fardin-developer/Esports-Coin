# Webhook Testing Guide

## Webhook Endpoint
- **URL**: `POST /api/v1/webhook/payment`
- **Content-Type**: `application/json`

## Sample Webhook Payload
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

## Testing with cURL

### 1. Test Successful Payment
```bash
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

### 2. Test Failed Payment
```bash
curl -X POST http://localhost:3000/api/v1/webhook/payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "78676878668",
    "txnId": "orderw4jpmxhaw7cwjrxsgue4apqzr927qr",
    "amount": 100,
    "scannerIncluded": false,
    "customerName": "Jane Doe",
    "customerEmail": "janedoe@gmail.com",
    "customerNumber": 7099200829,
    "paymentNote": "OneGateway",
    "redirectUrl": "https://www.onegateway.in/invoice",
    "utr": "425367561875",
    "payerUpi": "onegateway@yesbank",
    "status": "failed",
    "udf1": null,
    "udf2": null,
    "udf3": null
  }'
```

### 3. Test Pending Payment
```bash
curl -X POST http://localhost:3000/api/v1/webhook/payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "78676878669",
    "txnId": "orderw4jpmxhaw7cwjrxsgue4apqzr928qr",
    "amount": 150,
    "scannerIncluded": true,
    "customerName": "Bob Smith",
    "customerEmail": "bobsmith@gmail.com",
    "customerNumber": 7099200830,
    "paymentNote": "OneGateway",
    "redirectUrl": "https://www.onegateway.in/invoice",
    "utr": "425367561876",
    "payerUpi": "onegateway@yesbank",
    "status": "pending",
    "udf1": null,
    "udf2": null,
    "udf3": null
  }'
```

## Admin Endpoints

### Get Webhook History
```bash
curl -X GET http://localhost:3000/api/v1/webhook/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Specific Webhook
```bash
curl -X GET http://localhost:3000/api/v1/webhook/WEBHOOK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features

1. **Webhook Processing**: Automatically processes incoming webhook data
2. **Duplicate Prevention**: Prevents processing the same webhook multiple times
3. **Transaction Updates**: Updates existing transactions with webhook data
4. **Wallet Updates**: Automatically adds funds to user wallet on successful payments
5. **Raw Response Storage**: Stores complete webhook response for debugging
6. **Security**: Optional signature verification (can be enabled in production)
7. **Logging**: Comprehensive logging of all webhook requests
8. **Admin Interface**: Endpoints to view webhook history and details

## Database Schema

### Webhook Model
- Stores raw webhook responses
- Tracks processing status
- Includes all webhook fields
- Indexed for performance

### Transaction Model Updates
- Added `txnId` field
- Added `utr` field  
- Added `payerUpi` field
- Enhanced `gatewayResponse` storage

## Security Considerations

1. **Signature Verification**: Optional HMAC signature verification
2. **Environment Variables**: Set `WEBHOOK_SECRET` for production
3. **Rate Limiting**: Consider adding rate limiting for webhook endpoints
4. **IP Whitelisting**: Consider whitelisting OneGateway IPs in production 