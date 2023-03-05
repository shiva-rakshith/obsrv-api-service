import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import constants from "../resources/Constants.json"
import errorResponse from "http-errors";
import httpStatus from "http-status";
import _ from 'lodash'
import { Datasets } from "../helpers/Datasets";
import { IConnector } from "../models/IngestionModels";

export class DatasetService {
    private tableNameMap: Map<any, any> = new Map([
        ['ACTIVE', 'datasets'],
        ['DISABLED', 'datasets'],
        ['DRAFT', 'datasets_draft'],
        ['READY_FOR_PUBLISH', 'datasets_draft'],
        ['PUBLISHED', 'datasets_draft'],
    ]);
    private dbConnector: IConnector;
    constructor(dbConnector: IConnector) {
        this.dbConnector = dbConnector
        this.init()
    }
    public init = () => {
    }
    public save = (req: Request, res: Response, next: NextFunction) => {
        // TODO: Where is the user context passed?
        const dataset = new Datasets(req.body)
        req.body = dataset.setValues()
        this.dbConnector.execute("insert", { "table": this.getTableName(req.body.status), "fields": req.body })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASET_SAVED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public update = (req: Request, res: Response, next: NextFunction) => {
        const dataset = new Datasets(req.body)
        req.body = dataset.getValues()
        let message = req.body.status == 'PUBLISHED' ? constants.CONFIG.DATASET_PUBLISHED : constants.CONFIG.DATASET_UPDATED
        this.dbConnector.execute("update", { "table": this.getTableName(req.body.status), "fields": { "filters": { "id": req.body.id }, "values": req.body } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": message, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public read = (req: Request, res: Response, next: NextFunction) => {
        let status: any = req.query.status
        this.dbConnector.execute("read", { "table": this.getTableName(status), "fields": { "filters": { "id": req.params.datasetId } } })
            .then((data: any[]) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: _.first(data) })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public list = (req: Request, res: Response, next: NextFunction) => {
        this.dbConnector.execute("read", { "table": this.getTableName(req.body.filters.status), "fields": req.body })
            .then((data: any) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: data })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public preset = (req: Request, res: Response, next: NextFunction) => {
        try {
            let dataset = new Datasets({})
            let configDefault = dataset.getDefaults()
            ResponseHandler.successResponse(req, res, { status: 200, data: configDefault })
        } catch (error: any) {
            console.error(error)
            next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
        };
    }
    public publish = (req: Request, res: Response, next: NextFunction) => {
        this.dbConnector.execute("update", { "table": 'datasets_draft', "fields": { "filters": { "id": req.params.datasetId }, "values": { "status": "PUBLISHED", "updated_date": new Date, "published_date": new Date } } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASET_PUBLISHED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }

    private getTableName(status: string | string[]): string {
        let table;
        if (Array.isArray(status)) {
            if (status.includes("ACTIVE") || status.includes("DISABLED")) {
                table = "datasets";
            } else {
                table = "datasets_draft";
            }
        } else {
            table = this.tableNameMap.get(status) || "datasets_draft";
        }
        return table;
    }
}