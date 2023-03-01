import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { config } from "../configs/Config";
import constants from "../resources/Constants.json"
import errorResponse from "http-errors";
import httpStatus from "http-status";
import _ from 'lodash'
import { Datasets } from "../helpers/Datasets";
import { IConnector } from "../models/IngestionModels";
const responseHandler = ResponseHandler;


export class DatasetService {
    private DBConnector: IConnector;
    private KafkaConnector: IConnector;
    constructor(DBConnector: IConnector, KafkaConnector: IConnector) {
        this.DBConnector = DBConnector
        this.KafkaConnector = KafkaConnector
        this.init()
    }
    public init = () => {
        this.KafkaConnector.connect()
            .then(() => console.info("Kafka Connection Established..."))
            .catch((err: Error) => console.error(`Kafka Connection failed ${err.message}`))
    }
    public create = (req: Request, res: Response, next: NextFunction) => {
        req.body.data = Object.assign(req.body.data, { "dataset": this.getDatasetId(req.url) })
        this.KafkaConnector.execute(config.dataset_api.kafka.topics.create, { "value": JSON.stringify(req.body.data) })
            .then(() => {
                responseHandler.successResponse(req, res, { status: 200, data: { "message": constants.DATASET.CREATED } })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            })
    }
    public save = (req: Request, res: Response, next: NextFunction) => {
        const dataset = new Datasets(req.body)
        this.DBConnector.execute("insert", { "table": 'datasets', "fields": dataset.setValues() })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASET_SAVED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public update = (req: Request, res: Response, next: NextFunction) => {
        const dataset = new Datasets(req.body)
        this.DBConnector.execute("update", { "table": 'datasets', "fields": { "filters": { "id": req.body.id }, "values": dataset.getValues() } })
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.CONFIG.DATASET_UPDATED, "dataset_id": req.body.id } })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public read = (req: Request, res: Response, next: NextFunction) => {
        this.DBConnector.execute("read", { "table": 'datasets', "fields": { "filters": req.query } })
            .then((data: any) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: data[0] })
            }).catch((error: any) => {
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            });
    }
    public list = (req: Request, res: Response, next: NextFunction) => {
        this.DBConnector.execute("read", { "table": 'datasets', "fields": req.body })
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
    private getDatasetId(payload: any) {
        let dataset_id = payload.substring(payload.lastIndexOf('/') + 1)
        if (!_.isEmpty(dataset_id)) return dataset_id
        throw new Error("dataset parameter in url cannot be empty")
    }
}