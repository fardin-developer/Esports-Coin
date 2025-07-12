import { Router } from "express";
const router = Router();

import { createApi, getAllApis, getApiById } from "../../controller/apiController";
import { asyncHandler } from "../../middlewares";

// Create a new API
router.post('/create', asyncHandler(createApi));

// Get all APIs
router.get('/list', asyncHandler(getAllApis));

// Get API by ID
router.get('/:id', asyncHandler(getApiById));

export default router; 