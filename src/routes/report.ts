import { Router } from "express";
const router = Router();
import { asyncHandler, } from "../middlewares";
import { getData } from "../controller/reportController";

router.get('/messages', asyncHandler(getData));

export default router
