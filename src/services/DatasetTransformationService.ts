import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import _ from 'lodash'
import { DatasetTransformations } from "../helpers/DatasetTransformations";
import { IConnector } from "../models/IngestionModels";
import { findAndSetExistingRecord, setAuditState } from "./telemetry";
import { DbUtil } from "../helpers/DbUtil";
export class DatasetTransformationService {
    private table: string
    private dbConnector: IConnector;
    private dbUtil: DbUtil
    constructor(dbConnector: IConnector, table: string) {
        this.dbConnector = dbConnector
        this.table = table
        this.dbUtil = new DbUtil(dbConnector, table)
    }
    public save = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const datasetTransformation = new DatasetTransformations(req.body)
            const payload: any = datasetTransformation.setValues()
            await this.dbUtil.save(req, res, next, payload)
        }
        catch (error: any) {
            console.error(error.message)
            setAuditState("failed", req);
            next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] });

        }
    }
    public update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const datasetTransformation = new DatasetTransformations(req.body)
            const payload = datasetTransformation.getValues()
            await findAndSetExistingRecord({ dbConnector: this.dbConnector, table: this.table, request: req, filters: { "id": payload.id }, object: { id: payload.id, type: "transformation" } });
            await this.dbUtil.update(req, res, next, payload)
        }
        catch (error: any) {
            console.error(error.message)
            setAuditState("failed", req);
            next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] });
        }
    }
    public read = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let status: any = req.query.status || "ACTIVE"
            const id = req.params.datasetId
            await this.dbUtil.read(req, res, next, { id, status })
        }

        catch (error: any) {
            console.error(error.message)
            next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] });
        }
    }
    public list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = req.body
            await this.dbUtil.list(req, res, next, payload)
        } catch (error: any) {
            console.error(error.message)
            next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message, errCode: error.code || httpStatus["500_NAME"] });
        }
    }
}