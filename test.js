const axios = require("axios");
const crypto = require("crypto");

// ✅ Merchant credentials from PHP config
const merchant = {
  uid: "2749419",
  email: "smileone0102@gmail.com",
  key: "386dac5a15be42c5d74e8ea507826115",
  domain: "https://www.smile.one",
};

// ✅ API Endpoint (product list)
const apiUrl = `${merchant.domain}/smilecoin/api/productlist`;

// ✅ Request params
const params = {
  uid: merchant.uid,
  email: merchant.email,
  product: "mobilelegends", // required
  time: Math.floor(Date.now() / 1000), // UNIX timestamp
};

// ✅ Function to generate sign (matches PHP logic)
function generateSign(data, key) {
  const sortedKeys = Object.keys(data).sort();
  let str = "";
  for (const k of sortedKeys) {
    str += `${k}=${data[k]}&`;
  }
  str += key;

  // Double MD5
  const first = crypto.createHash("md5").update(str).digest("hex");
  return crypto.createHash("md5").update(first).digest("hex");
}

// ✅ Add sign to request
params.sign = generateSign(params, merchant.key);

// ✅ Convert to URL-encoded form
const formEncoded = new URLSearchParams(params).toString();

// ✅ Make the POST request
axios
  .post(apiUrl, formEncoded, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
.then((res) => {
  console.log("🔍 Full API Response:");
  console.log(JSON.stringify(res.data, null, 2));

  // Try printing the product field safely
  const products = res.data?.product;
  if (Array.isArray(products)) {
    console.log(`✅ Found ${products.length} products:\n`);
    products.forEach((product, index) => {
      console.log(`🔹 Product ${index + 1}:`, product);
    });
  } else {
    console.log("❌ 'product' field not found in response.");
  }
});

  
