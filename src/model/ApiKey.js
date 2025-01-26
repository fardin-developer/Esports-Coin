const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
  key: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Optional if keys expire
  isRevoked: { type: Boolean, default: false }, // For soft deletion
});

module.exports = mongoose.model("ApiKey", apiKeySchema);
