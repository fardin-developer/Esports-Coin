import { Router } from "express";
const router = Router();

import {  logout, getUser, sendPhoneOTP, verifyPhoneOTP, completeRegistration } from "../../controller/userController";
import { asyncHandler, useAuth, AuthMethod } from "../../middlewares";

// Phone-based authentication routes
router.post('/send-otp', asyncHandler(sendPhoneOTP));
router.post('/verify-otp', asyncHandler(verifyPhoneOTP));
router.post('/complete-registration', asyncHandler(completeRegistration));

// Legacy email-based authentication routes
// router.post('/register', asyncHandler(register));
// router.post('/login', asyncHandler(login));

//peofile 
router.post('/logout', asyncHandler(logout));
router.get('/me', useAuth([AuthMethod.JWT]), asyncHandler(getUser));

export default router