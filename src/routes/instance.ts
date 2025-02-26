const express = require('express')
const router = express.Router();
import { createInstance, getInstanceByKey, getInstances } from "../controller/InstanceKeyController";
import { asyncHandler } from "../middlewares";

router.post('/create', asyncHandler(createInstance));
router.get('/all', asyncHandler(getInstances))
router.get('/:key', asyncHandler(getInstanceByKey))

export default router