import express from "express";
import {
  getWebhookUrlByApiKey,
  setWebhookUrlByApiKey,
} from "../controller/webhookController"; 
import { Request, Response } from "express";


const router = express.Router();

// Route to get the webhook URL by API key
// router.get("/:apiKey", getWebhookUrlByApiKey);

// Route to set/update the webhook URL by API key
router.post("/:apiKey", setWebhookUrlByApiKey);

export default router;
