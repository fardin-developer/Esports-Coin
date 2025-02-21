const express = require('express')
const router = express.Router();
import { createInstance, getInstanceById, getInstances } from "../controller/apikeyController";

router.post('/create', createInstance);
router.get('/all', getInstances)
router.get('/:id', getInstanceById)

export default router