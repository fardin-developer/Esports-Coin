import { Request, Response, Router } from "express";
const router = Router();


import { register, login } from "../controller/userController";
import { asyncHandler } from "../middlewares";

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));


export default router