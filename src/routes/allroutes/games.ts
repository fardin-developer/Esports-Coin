import { Router, Request, Response, NextFunction } from 'express';
import { createGame, getAllGames, getGameById } from '../../controller/gameController';
import { asyncHandler } from '../../middlewares';
import { uploadImage } from '../../middlewares/upload';

const router = Router();

// Create a new game (supports both file upload and URL)
router.post('/create', uploadImage, asyncHandler(createGame));

// Get all games
router.get('/get-all', asyncHandler(getAllGames));

// Get game by ID
router.get('/:id', asyncHandler(getGameById));

export default router; 