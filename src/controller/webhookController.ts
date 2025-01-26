import ApiKey from "../model/ApiKey";
import { Request, Response } from "express";

export const getWebhookUrlByApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey } = req.params;

    const apiKeyDoc = await ApiKey.findOne({ key: apiKey });

    if (!apiKeyDoc) {
      res.status(404).json({ error: "API key not found" });
      return;
    }

    res.status(200).json({ webhookUrl: apiKeyDoc.webhookUrl });
  } catch (error) {
    console.error("Error fetching webhook URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const setWebhookUrlByApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey } = req.params;
    const { webhookUrl } = req.body;
    console.log(apiKey);
    

    if (!webhookUrl) {
      res.status(400).json({ error: "webhookUrl is required" });
      return;
    }

    const apiKeyDoc = await ApiKey.findOneAndUpdate(
      { key: apiKey },
      { webhookUrl },
      { new: true }
    );

    if (!apiKeyDoc) {
      res.status(404).json({ error: "API key not found" });
      return;
    }

    res.status(200).json({
      message: "Webhook URL updated successfully",
      apiKey: apiKeyDoc.key,
      webhookUrl: apiKeyDoc.webhookUrl,
    });
  } catch (error) {
    console.error("Error updating webhook URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
