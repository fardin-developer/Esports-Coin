import { Router } from "express";
const router = Router();

import { register, login, getUser } from "../controller/userController";
import { asyncHandler, useAuth, AuthMethod } from "../middlewares";

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/user', useAuth([AuthMethod.JWT]), asyncHandler(getUser));

export default router