import { NextFunction, Request, Response } from "express";
import errorResponse from "http-errors";
import httpStatus from "http-status";
import { SchemaGenerationException } from "../configs/Exceptions/CustomExceptions";
import { DataSetSchema } from "../generators/DataSetSchema";
import { IngestionSchemaV2 } from "../generators/IngestionSchema";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { IConnector } from "../models/DataSetModels";
import { IngestionConfig, IngestionSchemeRequest } from "../models/IngestionModels";
import { DataSetSchemeRequest } from "../models/SchemaModels";
export class SchemaGeneratorService {
    private connector: IConnector;
    constructor(connector: IConnector) {
        this.connector = connector
        this.connector.connect();
    }
    public generateIngestionSchema = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = <IngestionSchemeRequest>req.body
            const schema = new IngestionSchemaV2(request.config.dataset, <IngestionConfig>request.config)
            const sample = new Map(Object.entries(request.schema));
            const spec = schema.generate(sample)
            ResponseHandler.successResponse(req, res, { status: 200, data: spec });
        } catch (error) {
            if (error instanceof SchemaGenerationException) {
                next(errorResponse((<SchemaGenerationException>error).statusCode, error.message));
            } else {
                next(errorResponse((httpStatus.INTERNAL_SERVER_ERROR, (<Error>error).message)));
            }
        }
    }

    public generateDataSetSchema = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = <DataSetSchemeRequest>req.body
            const schema = new DataSetSchema(request.config.dataset, request.config)
            const spec = schema.generate(request.data)
            ResponseHandler.successResponse(req, res, { status: 200, data: spec });
        } catch (error) {
            if (error instanceof SchemaGenerationException) {
                next(errorResponse((<SchemaGenerationException>error).statusCode, error.message));
            } else {
                next(errorResponse((httpStatus.INTERNAL_SERVER_ERROR, (<Error>error).message)));
            }
           
        }
    }

}