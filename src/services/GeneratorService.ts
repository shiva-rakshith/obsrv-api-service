import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { IngestionConfig, IngestionSchema } from "../generators/IngestionSchema";
import { SchemaGenerator } from "../generators/SchemaGenerator";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { IngestionSchemeRequest } from "../models/IngestionModels";
const responseHandler = new ResponseHandler();

export class GeneratorService {

    public generateIngestionSchema = async (req: Request, res: Response, next: NextFunction) => {
        const request = <IngestionSchemeRequest>req.body
        const schema = new IngestionSchema(request.config.dataSet, <IngestionConfig>request.config)
        const spec = schema.generate(request.data)
        responseHandler.successResponse(req, res, { status: 200, data: spec });
    }

    public generateDataSetSchema = async (req: Request, res: Response, next: NextFunction) => {
        const request = <IngestionSchemeRequest>req.body
        const schema = new SchemaGenerator(request.config.dataSet, new Map())
        const spec = schema.generate(request.data)
        responseHandler.successResponse(req, res, { status: 200, data: spec });
    }

}