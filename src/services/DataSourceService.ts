import constants from "../resources/Constants.json";
import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import errorResponse from "http-errors"
import httpStatus from "http-status";
import { IConnector } from "../models/IngestionModels";
import { Datasources } from "../helpers/Datasources";

export class DataSourceService {
    private connector: any;
    constructor(connector: IConnector) {
        this.connector = connector
    }
    public save = (req: Request, res: Response, next: NextFunction) => {
        const datasource = new Datasources(req.body)
        this.connector.execute("insert", { "table": 'datasources', "fields": datasource.setValues() })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASOURCE_SAVED, "id": datasource.getDataSourceId() } })
            }).catch((error: any) => {
                console.log(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public update = (req: Request, res: Response, next: NextFunction) => {
        const datasource = new Datasources(req.body)
        this.connector.execute("update", { "table": 'datasources', "fields": { "filters": { "id": datasource.getDataSourceId() }, "values": datasource.setValues() } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASOURCE_UPDATED, "id": datasource.getDataSourceId() } })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public read = (req: Request, res: Response, next: NextFunction) => {
        this.connector.execute("read", { "table": 'datasources', "fields": req.query })
            .then((data: any) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: data })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
}