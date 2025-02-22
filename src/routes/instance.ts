const express = require('express')
const router = express.Router();
import { createInstance, getInstanceById, getInstances } from "../controller/apikeyController";
import { asyncHandler } from "../middlewares";

router.post('/create', asyncHandler(createInstance));
router.get('/all', asyncHandler(getInstances))
router.get('/:id', asyncHandler(getInstanceById))

export default router