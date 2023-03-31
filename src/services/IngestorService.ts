import { Request, Response, NextFunction } from "express";
import constants from "../resources/Constants.json"
import { ResponseHandler } from "../helpers/ResponseHandler";
import _ from 'lodash'
import httpStatus from "http-status";

export class IngestorService {
    private kafkaConnector: any;
    constructor(kafkaConnector: any) {
        this.kafkaConnector = kafkaConnector
        this.init()
    }
    public init() {
        this.kafkaConnector.connect()
            .then(() => {
                console.log("kafka connection arranged succesfully...")
            })
            .catch((error: any) => {
                console.log("error while connecting to kafka", error.message)
            })
    }
    public create = (req: Request, res: Response, next: NextFunction) => {
        req.body = Object.assign(req.body.data, { "dataset": this.getDatasetId(req) });
        this.kafkaConnector.execute(req, res)
            .then(() => {
                ResponseHandler.successResponse(req, res, { status: 200, data: { "message": constants.DATASET.CREATED } })
            }).catch((error: any) => {
                next({ statusCode: error.status || httpStatus.INTERNAL_SERVER_ERROR, message: error.message || "", errCode: error.code || httpStatus["500_NAME"] })
            })
    }
    private getDatasetId(req: Request) {
        let datasetId = req.params.datasetId.trim()
        if (!_.isEmpty(datasetId)) return datasetId
        throw constants.EMPTY_DATASET_ID
    }
}