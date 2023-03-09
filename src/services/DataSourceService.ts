import constants from "../resources/Constants.json";
import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import errorResponse from "http-errors"
import httpStatus from "http-status";
import { IConnector } from "../models/IngestionModels";
import { Datasources } from "../helpers/Datasources";
import _ from "lodash";

export class DataSourceService {
    private tableNameMap: Map<any, any> = new Map([
        ['ACTIVE', 'datasources'],
        ['DISABLED', 'datasources'],
        ['DRAFT', 'datasources_draft'],
        ['READY_FOR_PUBLISH', 'datasources_draft'],
        ['PUBLISHED', 'datasources_draft'],
    ]);
    private connector: any;
    constructor(connector: IConnector) {
        this.connector = connector
    }
    public save = (req: Request, res: Response, next: NextFunction) => {
        const datasource = new Datasources(req.body)
        req.body = datasource.setValues()
        this.connector.execute("insert", { "table": this.getTableName(req.body.status), "fields": req.body })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASOURCE_SAVED, "id": datasource.getDataSourceId() } })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public update = (req: Request, res: Response, next: NextFunction) => {
        const datasource = new Datasources(req.body)
        req.body = datasource.getValues() 
        let message = req.body.status == 'PUBLISHED' ? constants.CONFIG.DATASOURCE_PUBLISHED : constants.CONFIG.DATASOURCE_UPDATED
        this.connector.execute("update", { "table": this.getTableName(req.body.status), "fields": { "filters": { "id": datasource.getDataSourceId() }, "values": req.body} })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": message, "id": datasource.getDataSourceId() } })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public read = (req: Request, res: Response, next: NextFunction) => {
        let status: any = req.query.status
        this.connector.execute("read", { "table": this.getTableName(status), "fields": { "filters": { "id": req.params.datasourceId } } })
            .then((data: any[]) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: _.first(data) })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public list = (req: Request, res: Response, next: NextFunction) => {
        this.connector.execute("read", { "table": this.getTableName(req.body.filters.status), "fields": req.body })
            .then((data: any) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: data })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public preset = (req: Request, res: Response, next: NextFunction) => {
        try {
            let datasource = new Datasources({})
            let configDefault = datasource.getDefaults()
            ResponseHandler.successResponse(req, res, { status: 200, data: configDefault })
        }
        catch (error: any) {
            console.error(error)
            next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
        }
    }
    public publish = (req: Request, res: Response, next: NextFunction) => {
        this.connector.execute("update", { "table": 'datasources_draft', "fields": { "filters": { "id": req.params.datasourceId }, "values": { "status": "PUBLISHED", "updated_date": new Date, "published_date": new Date } } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASOURCE_PUBLISHED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    private getTableName(status: string | string[]): string {

        if (!Array.isArray(status)) {
            return this.tableNameMap.get(status) || "datasources_draft";
        }
        else if (status.includes("ACTIVE") || status.includes("DISABLED")) {
            return "datasources";
        } else {
            return "datasources_draft";
        }
    }
}