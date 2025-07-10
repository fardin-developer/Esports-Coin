import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Game, { IGame } from '../model/Game';
import { getFileUrl } from '../middlewares/upload';

/**
 * Creates a new game
 */
export const createGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, publisher } = req.body;
    let imageUrl = req.body.image; // For URL strings

    // Check if file was uploaded
    if (req.file) {
      imageUrl = getFileUrl(req.file.filename);
    }

    if (!name || !imageUrl) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Game name and image are required' 
      });
      return;
    }

    const game = await Game.create({ name, image: imageUrl, publisher });
    
    res.status(StatusCodes.CREATED).json({ 
      success: true, 
      game 
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to create game' 
    });
  }
};

/**
 * Gets all games
 */
export const getAllGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const games = await Game.find({}).sort({ createdAt: -1 });
    
    res.status(StatusCodes.OK).json({ 
      success: true, 
      count: games.length,
      games 
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch games' 
    });
  }
};

/**
 * Gets a game by ID
 */
export const getGameById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        error: 'Game ID is required' 
      });
      return;
    }

    const game = await Game.findById(id);
    
    if (!game) {
      res.status(StatusCodes.NOT_FOUND).json({ 
        error: 'Game not found' 
      });
      return;
    }

    res.status(StatusCodes.OK).json({ 
      success: true, 
      game 
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to fetch game' 
    });
  }
}; 