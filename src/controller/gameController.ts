import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Game, { IGame } from '../model/Game';
import DiamondPack from '../model/DiamondPack';
import Api from '../model/Api';
import { getFileUrl } from '../middlewares/upload';

/**
 * Creates a new game
 */
export const createGame = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { name, publisher } = req.body;
    console.log(name);
    let imageUrl = req.body.image

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

/**
 * Creates a new diamond pack (product) for a game
 */
export const createDiamondPack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, commission, cashback, description, status, apiCalls, apiProvider, productId } = req.body;
    const { gameId } = req.params;
    let logoUrl = req.body.logo;

    // Check if file was uploaded
    if (req.file) {
      logoUrl = getFileUrl(req.file.filename);
    }

    if (!gameId || !amount || !commission || !cashback || !logoUrl || !description || !status || !apiCalls || !apiProvider || !productId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'All fields are required.'
      });
      return;
    }

    // Find the API provider by name or ID
    let apiProviderDoc;
    if (apiProvider.match(/^[0-9a-fA-F]{24}$/)) {
      // If it's a valid ObjectId, search by ID
      apiProviderDoc = await Api.findById(apiProvider);
    } else {
      // Otherwise, search by name
      apiProviderDoc = await Api.findOne({ name: apiProvider });
    }

    if (!apiProviderDoc) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'API provider not found. Please provide a valid API name or ID.'
      });
      return;
    }

    const diamondPack = await DiamondPack.create({
      game: gameId,
      amount,
      commission,
      cashback,
      logo: logoUrl,
      description,
      status,
      apiCalls,
      apiProvider: apiProviderDoc._id, // Use the ObjectId reference
      productId
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      diamondPack
    });
  } catch (error) {
    console.error('Error creating diamond pack:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to create diamond pack'
    });
  }
}; 

/**
 * Gets all diamond packs (products) for a game
 */
export const getDiamondPacksForGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    if (!gameId) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Game ID is required' });
      return;
    }
    const diamondPacks = await DiamondPack.find({ game: gameId })
      .populate('apiProvider', 'name apiUrl description') // Populate API provider details
      .sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({
      success: true,
      count: diamondPacks.length,
      diamondPacks
    });
  } catch (error) {
    console.error('Error fetching diamond packs:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch diamond packs' });
  }
};

/**
 * Gets a diamond pack (product) by its ID
 */
export const getDiamondPackById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { diamondPackId } = req.params;
    console.log(diamondPackId);
    if (!diamondPackId) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Diamond pack ID is required' });
      return;
    }
    const diamondPack = await DiamondPack.findById(diamondPackId)
      .populate('apiProvider', 'name apiUrl description'); // Populate API provider details
    if (!diamondPack) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Diamond pack not found' });
      return;
    }
    res.status(StatusCodes.OK).json({
      success: true,
      diamondPack
    });
  } catch (error) {
    console.error('Error fetching diamond pack:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch diamond pack' });
  }
}; 