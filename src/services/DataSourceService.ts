import constants from "../resources/Constants.json";
import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import httpStatus from "http-status";
import { IConnector } from "../models/IngestionModels";
import { Datasources } from "../helpers/Datasources";
import _ from "lodash";
import { findAndSetExistingRecord, setAuditState } from "./telemetry";

export class DataSourceService {
    private table: string
    private connector: any;
    constructor(connector: IConnector) {
        this.connector = connector
        this.table = "datasources"
    }
    public save = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fetchedRecord = await this.connector.execute("read", { table: this.table, fields: { filters: { "dataset_id": req.body.dataset_id, "datasource": req.body.datasource } } })
            if (!_.isEmpty(fetchedRecord)) { throw constants.DUPLICATE_RECORD }

            const datasource = new Datasources(req.body)
            const datasourceRecord: any = datasource.setValues()
            this.connector.execute("insert", { "table": this.table, "fields": datasourceRecord })
                .then(() => {
                    ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASOURCE_SAVED, "id": datasourceRecord.datasource } })
                }).catch((error: any) => {
                    console.error(error.message)
                    setAuditState("failed", req);
                    next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
                })
        }
        catch (error: any) {
            console.error(error.message)
            setAuditState("failed", req);
            next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] });

        }
    }
    public update = async (req: Request, res: Response, next: NextFunction) => {
        const datasource = new Datasources(req.body)
        const datasourceRecord: any = datasource.getValues()
        await findAndSetExistingRecord({ dbConnector: this.connector, table: this.table, request: req, filters: { "datasource": datasourceRecord.datasource }, object: { id: datasourceRecord.datasource, type: "datasource" } });

        this.connector.execute("update", { "table": this.table, "fields": { "filters": { "datasource": datasourceRecord.datasource }, "values": datasourceRecord } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASOURCE_UPDATED, "id": datasourceRecord.datasource } })
            }).catch((error: any) => {
                console.error(error.message)
                setAuditState("failed", req);
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
            });
    }
    public read = (req: Request, res: Response, next: NextFunction) => {
        let status: any = req.query.status || "ACTIVE"
        const id = req.params.datasourceId
        this.connector.execute("read", { "table": this.table, "fields": { "filters": { "id": id, "status": status } } })
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
        const fields = req.body
        this.connector.execute("read", { "table": this.table, "fields": fields })
            .then((data: any) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: data })
            }).catch((error: any) => {
                console.error(error.message)
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] })
            });
    }
}