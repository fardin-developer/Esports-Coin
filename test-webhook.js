const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_URL = `${BASE_URL}/api/v1/webhook/payment`;

// Sample webhook payloads
const webhookPayloads = {
  success: {
    orderId: "78676878667",
    txnId: "orderw4jpmxhaw7cwjrxsgue4apqzr926qr",
    amount: 200,
    scannerIncluded: true,
    customerName: "John Doe",
    customerEmail: "johndoe@gmail.com",
    customerNumber: 7099200828,
    paymentNote: "OneGateway",
    redirectUrl: "https://www.onegateway.in/invoice",
    utr: "425367561874",
    payerUpi: "onegateway@yesbank",
    status: "success",
    udf1: null,
    udf2: null,
    udf3: null
  },
  failed: {
    orderId: "78676878668",
    txnId: "orderw4jpmxhaw7cwjrxsgue4apqzr927qr",
    amount: 100,
    scannerIncluded: false,
    customerName: "Jane Doe",
    customerEmail: "janedoe@gmail.com",
    customerNumber: 7099200829,
    paymentNote: "OneGateway",
    redirectUrl: "https://www.onegateway.in/invoice",
    utr: "425367561875",
    payerUpi: "onegateway@yesbank",
    status: "failed",
    udf1: null,
    udf2: null,
    udf3: null
  },
  pending: {
    orderId: "78676878669",
    txnId: "orderw4jpmxhaw7cwjrxsgue4apqzr928qr",
    amount: 150,
    scannerIncluded: true,
    customerName: "Bob Smith",
    customerEmail: "bobsmith@gmail.com",
    customerNumber: 7099200830,
    paymentNote: "OneGateway",
    redirectUrl: "https://www.onegateway.in/invoice",
    utr: "425367561876",
    payerUpi: "onegateway@yesbank",
    status: "pending",
    udf1: null,
    udf2: null,
    udf3: null
  }
};

async function testWebhook(payload, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📤 Sending webhook to: ${WEBHOOK_URL}`);
    console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Success! Status: ${response.status}`);
    console.log(`📥 Response:`, JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`📥 Error Response:`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Webhook Tests...\n');
  
  // Test successful payment
  await testWebhook(webhookPayloads.success, 'Successful Payment');
  
  // Test failed payment
  await testWebhook(webhookPayloads.failed, 'Failed Payment');
  
  // Test pending payment
  await testWebhook(webhookPayloads.pending, 'Pending Payment');
  
  // Test duplicate webhook (should be ignored)
  await testWebhook(webhookPayloads.success, 'Duplicate Webhook (should be ignored)');
  
  console.log('\n🎉 All tests completed!');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/v1/user`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start your server first.');
    console.log('💡 Run: npm start or node src/server.ts');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main().catch(console.error); 