import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Api, { IApi } from "../model/Api";

// Create a new API
export const createApi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, apiUrl, description, partnerId, secretKey } = req.body;

    if (!name || !apiUrl) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        message: "Name and API URL are required" 
      });
      return;
    }

    // Check if API with same name already exists
    const existingApi = await Api.findOne({ name });
    if (existingApi) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        message: "API with this name already exists" 
      });
      return;
    }

    const api = await Api.create({ name, apiUrl, description, partnerId, secretKey });

    res.status(StatusCodes.CREATED).json({ 
      message: "API created successfully",
      api: {
        id: api._id,
        name: api.name,
        apiUrl: api.apiUrl,
        description: api.description,
        partnerId: api.partnerId,
        createdAt: api.createdAt,
        updatedAt: api.updatedAt
      }
    });
  } catch (error) {
    console.error("Error creating API:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "An error occurred while creating the API" 
    });
  }
};

// Get all APIs
export const getAllApis = async (req: Request, res: Response): Promise<void> => {
  try {
    const apis = await Api.find({}).sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ 
      message: "APIs retrieved successfully",
      count: apis.length,
      apis: apis.map(api => ({
        id: api._id,
        name: api.name,
        apiUrl: api.apiUrl,
        description: api.description,
        partnerId: api.partnerId,
        createdAt: api.createdAt,
        updatedAt: api.updatedAt
      }))
    });
  } catch (error) {
    console.error("Error fetching APIs:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "An error occurred while fetching APIs" 
    });
  }
};

// Get API by ID
export const getApiById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({ 
        message: "API ID is required" 
      });
      return;
    }

    const api = await Api.findById(id);

    if (!api) {
      res.status(StatusCodes.NOT_FOUND).json({ 
        message: "API not found" 
      });
      return;
    }

    res.status(StatusCodes.OK).json({ 
      message: "API retrieved successfully",
      api: {
        id: api._id,
        name: api.name,
        apiUrl: api.apiUrl,
        description: api.description,
        partnerId: api.partnerId,
        createdAt: api.createdAt,
        updatedAt: api.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching API:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "An error occurred while fetching the API" 
    });
  }
}; 