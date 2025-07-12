import OTP, { IOTP } from "../model/OTP";
import User from "../model/User";
import { StatusCodes } from "http-status-codes";

// Fast2SMS API configuration
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || "9UQ2hsY5faWKq7J8Rli6nyiX6GNRMaKsG6ZhjZPybejQdCjhl1WrELMO9Apz";
const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";
const SENDER_ID = process.env.FAST2SMS_SENDER_ID || "ONEAPI";
const MESSAGE_TEMPLATE_ID = process.env.FAST2SMS_TEMPLATE_ID || "163299";

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to phone number using Fast2SMS API
export const sendOTP = async (phone: string, otp: string): Promise<boolean> => {
  try {
    const requestBody = {
      route: "dlt",
      sender_id: SENDER_ID,
      message: MESSAGE_TEMPLATE_ID,
      variables_values: `|${otp}|`, // Format: |OTP|
      schedule_time: "",
      flash: 0,
      numbers: phone,
    };

    const response = await fetch(FAST2SMS_URL, {
      method: "POST",
      headers: {
        "authorization": FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    
    if (response.ok && result.return === true) {
      console.log(`OTP ${otp} sent successfully to ${phone}`);
      return true;
    } else {
      console.error("Fast2SMS API error:", result);
      return false;
    }
  } catch (error) {
    console.error("Error sending OTP via Fast2SMS:", error);
    return false;
  }
};

// Create and send OTP
export const createAndSendOTP = async (phone: string): Promise<{ success: boolean; message: string }> => {
  try {
    const existingOTP = await OTP.findOne({
      phone,
      expiresAt: { $gt: new Date() },
      isUsed: false,
    });

    if (existingOTP) {
      const timeLeft = Math.ceil((existingOTP.expiresAt.getTime() - Date.now()) / 1000);
      return {
        success: false,
        message: `Please wait ${timeLeft} seconds before requesting another OTP`,
      };
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiry

    // Save OTP to database
    await OTP.create({
      phone,
      otp,
      expiresAt,
    });

    // Send OTP
    const sent = await sendOTP(phone, otp);
    if (!sent) {
      return {
        success: false,
        message: "Failed to send OTP. Please try again.",
      };
    }

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error("Error creating OTP:", error);
    return {
      success: false,
      message: "Failed to create OTP. Please try again.",
    };
  }
};

// Verify OTP
export const verifyOTP = async (phone: string, otp: string): Promise<{ success: boolean; message: string; userExists?: boolean }> => {
  try {
    // Find the OTP
    const otpRecord = await OTP.findOne({
      phone,
      otp,
      expiresAt: { $gt: new Date() },
      isUsed: false,
    });

    if (!otpRecord) {
      return {
        success: false,
        message: "Invalid or expired OTP",
      };
    }

    // Mark OTP as used
    await OTP.findByIdAndUpdate(otpRecord._id, { isUsed: true });

    // Check if user exists
    const user = await User.findOne({ phone });
    console.log(user);
    
    const userExists = !!user;

    return {
      success: true,
      message: "OTP verified successfully",
      userExists,
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: "Failed to verify OTP. Please try again.",
    };
  }
}; 