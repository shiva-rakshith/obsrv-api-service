import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import constants from "../resources/Constants.json"
import httpStatus from "http-status";
import _ from 'lodash'
import { Datasets } from "../helpers/Datasets";
import { IConnector } from "../models/IngestionModels";

export class DatasetService {
    private table: string
    private dbConnector: IConnector;
    constructor(dbConnector: IConnector) {
        this.dbConnector = dbConnector
        this.table = "datasets"
    }
    public save = (req: Request, res: Response, next: NextFunction) => {
        const dataset = new Datasets(req.body)
        req.body = dataset.setValues()
        this.dbConnector.execute("insert", { "table": this.table, "fields": req.body })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASET_SAVED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                console.error(error.message)
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
            });
    }
    public update = (req: Request, res: Response, next: NextFunction) => {
        const dataset = new Datasets(req.body)
        req.body = dataset.getValues()
        this.dbConnector.execute("update", { "table": this.table, "fields": { "filters": { "id": req.body.id }, "values": req.body } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASET_UPDATED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                console.error(error.message)
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
            });
    }
    public read = (req: Request, res: Response, next: NextFunction) => {
        let status: any = req.query.status
        this.dbConnector.execute("read", { "table": this.table, "fields": { "filters": { "id": req.params.datasetId, "status": status } } })
            .then((data: any[]) => {
                !_.isEmpty(data) ? ResponseHandler.successResponse(req, res, { status: 200, data: _.first(data) }) : (() => {
                    throw constants.RECORD_NOT_FOUND
                })()
            }).catch((error: any) => {
                console.error(error.message)
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
            });
    }
    public list = (req: Request, res: Response, next: NextFunction) => {
        this.dbConnector.execute("read", { "table": this.table, "fields": req.body })
            .then((data: any) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: data })
            }).catch((error: any) => {
                console.error(error.message)
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
            });
    }
    public preset = (req: Request, res: Response, next: NextFunction) => {
        try {
            let dataset = new Datasets({})
            let configDefault = dataset.getDefaults()
            ResponseHandler.successResponse(req, res, { status: 200, data: {} })
        } catch (error: any) {
            console.error(error.message)
            next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
        };
    }
}