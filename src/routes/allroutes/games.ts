import { Router, Request, Response, NextFunction } from 'express';
import { createGame, getAllGames, getGameById, createDiamondPack, getDiamondPacksForGame, getDiamondPackById } from '../../controller/gameController';
import { asyncHandler } from '../../middlewares';
import { uploadImage } from '../../middlewares/upload';

const router = Router();

// Create a new game (supports both file upload and URL)
router.post('/create', uploadImage, asyncHandler(createGame));

// Get all games
router.get('/get-all', asyncHandler(getAllGames));

// Get game by ID
router.get('/:id', asyncHandler(getGameById));

// Create a new diamond pack (product) for a game
router.post('/:gameId/diamond-pack', uploadImage, asyncHandler(createDiamondPack));

// Get all diamond packs (products) for a game
router.get('/:gameId/diamond-packs', asyncHandler(getDiamondPacksForGame));

// Get a diamond pack (product) by its ID
router.get('/diamond-pack/:diamondPackId', asyncHandler(getDiamondPackById));

export default router; 