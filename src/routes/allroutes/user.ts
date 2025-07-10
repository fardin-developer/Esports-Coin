import { Router } from "express";
const router = Router();

import { register, login, logout, getUser } from "../../controller/userController";
import { asyncHandler, useAuth, AuthMethod } from "../../middlewares";

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/me', useAuth([AuthMethod.JWT]), asyncHandler(getUser));

export default router