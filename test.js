const axios = require("axios");
const crypto = require("crypto");

const key = "7f663422060edd50b326b8a570639dac"; // Secret key from Smile API

const params = {
  uid: "1041302",
  email: "agent@smileone.com",
  product: "mobilelegends",
  time: Math.floor(Date.now() / 1000), // current UNIX timestamp
};

// Step 1: Sort params alphabetically
const sortedKeys = Object.keys(params).sort();
let strToHash = "";

sortedKeys.forEach((key) => {
  strToHash += `${key}=${params[key]}&`;
});
strToHash += key;

// Step 2: MD5(MD5(...))
const md5Once = crypto.createHash("md5").update(strToHash).digest("hex");
const finalSign = crypto.createHash("md5").update(md5Once).digest("hex");

// Step 3: Add sign to params
params.sign = finalSign;

// Step 4: Send POST request (x-www-form-urlencoded)
const qs = new URLSearchParams(params).toString();

axios
  .post("https://www.smile.one/smilecoin/api/productlist", qs, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
  .then((res) => {
    console.log("✅ Success:", res.data);
  })
  .catch((err) => {
    console.error("❌ Error:", err.response?.data || err.message);
  });
