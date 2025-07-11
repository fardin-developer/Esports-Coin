# Testing the Phone-Based Authentication Flow

## Test Cases

### 1. Send OTP to New Phone Number
```bash
curl -X POST http://localhost:3000/api/user/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

**Expected Response:**
```json
{
  "message": "OTP sent successfully",
  "phone": "9876543210"
}
```

### 2. Verify OTP for New User (without registration data)
```bash
curl -X POST http://localhost:3000/api/user/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

**Expected Response:**
```json
{
  "message": "OTP verified. Please provide name and password to complete registration.",
  "requiresRegistration": true,
  "phone": "9876543210"
}
```

### 3. Complete Registration for New User
```bash
curl -X POST http://localhost:3000/api/user/complete-registration \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

**Expected Response:**
```json
{
  "message": "Registration completed successfully",
  "user": {
    "name": "John Doe",
    "email": null
  },
  "token": "jwt_token_here",
  "isNewUser": true
}
```

### 4. Send OTP to Existing Phone Number
```bash
curl -X POST http://localhost:3000/api/user/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

### 5. Verify OTP for Existing User
```bash
curl -X POST http://localhost:3000/api/user/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "name": "John Doe",
    "email": null
  },
  "token": "jwt_token_here",
  "isNewUser": false
}
```

### 6. Test Invalid OTP
```bash
curl -X POST http://localhost:3000/api/user/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "000000"}'
```

**Expected Response:**
```json
{
  "message": "Invalid or expired OTP"
}
```

### 7. Test Rate Limiting
```bash
# Send OTP multiple times quickly
curl -X POST http://localhost:3000/api/user/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Should get rate limit message
```

**Expected Response:**
```json
{
  "message": "Please wait X seconds before requesting another OTP"
}
```

## Frontend Integration Test

### Step 1: Phone Input
```javascript
const phone = "9876543210";
const response = await fetch('/api/user/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone })
});
// Should show OTP input screen
```

### Step 2: OTP Verification
```javascript
const otp = "123456"; // Get from console log in development
const response = await fetch('/api/user/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone, otp })
});

const data = await response.json();
if (data.requiresRegistration) {
  // Show registration form
  showRegistrationForm();
} else {
  // Login successful, redirect to home
  localStorage.setItem('token', data.token);
  window.location.href = '/home';
}
```

### Step 3: Registration (if new user)
```javascript
const name = "John Doe";
const password = "securepassword123";
const response = await fetch('/api/user/complete-registration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone, name, password })
});

const data = await response.json();
localStorage.setItem('token', data.token);
window.location.href = '/home';
```

## Database Verification

After successful registration, check the database:

```javascript
// User should be created with:
{
  name: "John Doe",
  phone: "9876543210",
  password: "hashed_password",
  apiKey: "generated_api_key",
  walletBalance: 0,
  verified: false
}

// OTP should be marked as used:
{
  phone: "9876543210",
  otp: "123456",
  isUsed: true,
  expiresAt: "timestamp"
}
```

## Security Features Verified

- ✅ OTP expires after 5 minutes
- ✅ OTP can only be used once
- ✅ Rate limiting prevents spam
- ✅ Phone number validation
- ✅ Password hashing
- ✅ JWT token generation
- ✅ API key generation for new users
- ✅ Wallet balance initialization 