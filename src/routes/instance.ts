const express = require('express')
const router = express.Router();
import { createInstance, getInstanceByKey, getInstances, disconnectInstance } from "../controller/InstanceKeyController";
import { asyncHandler } from "../middlewares";

router.post('/create', asyncHandler(createInstance));
router.get('/all', asyncHandler(getInstances))
router.post('/disconnect', asyncHandler(disconnectInstance));
router.get('/:key', asyncHandler(getInstanceByKey));

export default router