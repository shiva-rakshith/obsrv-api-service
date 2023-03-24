import constants from "../resources/Constants.json";
import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import httpStatus from "http-status";
import { IConnector } from "../models/IngestionModels";
import { Datasources } from "../helpers/Datasources";
import _ from "lodash";

export class DataSourceService {
    private table: string
    private connector: any;
    constructor(connector: IConnector) {
        this.connector = connector
        this.table = "datasources"
    }
    public save = (req: Request, res: Response, next: NextFunction) => {
        const datasource = new Datasources(req.body)
        req.body = datasource.setValues()
        this.connector.execute("insert", { "table": this.table, "fields": req.body })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASOURCE_SAVED, "id": datasource.getDataSourceId() } })
            }).catch((error: any) => {
                console.error(error.message)
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
            });
    }
    public update = (req: Request, res: Response, next: NextFunction) => {
        const datasource = new Datasources(req.body)
        req.body = datasource.getValues()
        this.connector.execute("update", { "table": this.table, "fields": { "filters": { "id": datasource.getDataSourceId() }, "values": req.body } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASOURCE_UPDATED, "id": datasource.getDataSourceId() } })
            }).catch((error: any) => {
                console.error(error.message)
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
            });
    }
    public read = (req: Request, res: Response, next: NextFunction) => {
        let status: any = req.query.status
        this.connector.execute("read", { "table": this.table, "fields": { "filters": { "id": req.params.datasourceId } } })
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
        this.connector.execute("read", { "table": this.table, "fields": req.body })
            .then((data: any) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: data })
            }).catch((error: any) => {
                console.error(error.message)
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
            });
    }
    public preset = (req: Request, res: Response, next: NextFunction) => {
        try {
            let datasource = new Datasources({})
            let configDefault = datasource.getDefaults()
            ResponseHandler.successResponse(req, res, { status: 200, data: configDefault })
        }
        catch (error: any) {
            console.error(error.message)
            next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
        }
    }

}