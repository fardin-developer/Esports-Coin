import { Request, Response, Router } from "express";
const router = Router();


import { register, login } from "../controller/userController";
import { createApiKey } from "../controller/apikeyController";

router.post('/register', register);
router.post('/apikey/create', createApiKey);

router.post('/login', login);


export default router