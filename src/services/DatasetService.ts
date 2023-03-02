import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import constants from "../resources/Constants.json"
import errorResponse from "http-errors";
import httpStatus from "http-status";
import _ from 'lodash'
import { Datasets } from "../helpers/Datasets";
import { IConnector } from "../models/IngestionModels";

export class DatasetService {
    private dbConnector: IConnector;
    constructor(dbConnector: IConnector) {
        this.dbConnector = dbConnector
        this.init()
    }
    public init = () => {
    }
    public save = (req: Request, res: Response, next: NextFunction) => {
        // TODO: Add validations. For ex: Check whether the datasetId already exists.
        // TODO: Where is the user context passed?
        const dataset = new Datasets(req.body)
        this.dbConnector.execute("insert", { "table": 'datasets', "fields": dataset.setValues() })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASET_SAVED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public update = (req: Request, res: Response, next: NextFunction) => {
        const dataset = new Datasets(req.body)
        this.dbConnector.execute("update", { "table": 'datasets', "fields": { "filters": { "id": req.body.id }, "values": dataset.getValues() } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASET_UPDATED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public read = (req: Request, res: Response, next: NextFunction) => {
        this.dbConnector.execute("read", { "table": 'datasets', "fields": { "filters": { "id": req.params.datasetId } } })
            .then((data: any[]) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: _.first(data) })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public list = (req: Request, res: Response, next: NextFunction) => {
        this.dbConnector.execute("read", { "table": 'datasets', "fields": req.body })
            .then((data: any) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: data })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public preset = (req: Request, res: Response, next: NextFunction) => {
        try {
            let dataset = new Datasets({})
            let configDefault = dataset.getDefaults()
            ResponseHandler.successResponse(req, res, { status: 200, data: configDefault })
        } catch (error: any) {
            next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
        }
    }
    public publish = (req: Request, res: Response, next: NextFunction) => {
        this.dbConnector.execute("update", { "table": 'datasets', "fields": { "filters": { "id": req.params.datasetId }, "values": { "status": "LIVE", "updated_date": new Date, "published_date": new Date } } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASET_PUBLISHED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
}