import { Request, Response, Router } from "express";
const router = Router();


import { register, login } from "../controller/userController";
router.post('/register', register);
router.post('/login', login);


export default router