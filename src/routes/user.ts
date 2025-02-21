import { Request, Response, Router } from "express";
const router = Router();


import { register, login } from "../controller/userController";
import { createInstance } from "../controller/apikeyController";

router.post('/register', register);
router.post('/instance/create', createInstance);

router.post('/login', login);


export default router