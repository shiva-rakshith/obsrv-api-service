import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { config } from "../configs/Config";
import constants from "../resources/Constants.json"
import errorResponse from "http-errors";
import httpStatus from "http-status";
import _ from 'lodash'
import { IConnector } from "../models/IngestionModels";
const responseHandler = ResponseHandler;


export class IngestorService {
    private kafkaConnector: IConnector;
    constructor(kafkaConnector: IConnector) {
        this.kafkaConnector = kafkaConnector
        this.init()
    }
    public init = () => {
        this.kafkaConnector.connect()
            .then(() => console.info("Kafka Connection Established..."))
            .catch((err: Error) => console.error(`Kafka Connection failed ${err.message}`))
    }
    // TODO: Support the following ingestion types:
    // 1. Ingest a json zip stream
    // 2. Ingest a normal json batch data
    // 3. Ingest a single event
    // 4. Ingest a csv file
    // 5. Ingest a parquet/grpc file
    public create = (req: Request, res: Response, next: NextFunction) => {
        // TODO: Perform all necessary validations that can be done without slowing down the ingestion
        // 1. Check if the dataset is active
        // 2. Check if the data is as per the extraction config
        req.body.data = Object.assign(req.body.data, { "dataset": this.getDatasetId(req) })
        this.kafkaConnector.execute(config.dataset_api.kafka.topics.create, { "value": JSON.stringify(req.body.data) })
            .then(() => {
                responseHandler.successResponse(req, res, { status: 200, data: { "message": constants.DATASET.CREATED } })
            }).catch((error: any) => {
                console.error(error)
                next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message))
            })
    }
    private getDatasetId(req: Request) {
        let datasetId = req.params.datasetId.trim()
        if (!_.isEmpty(datasetId)) return datasetId
        throw new Error("datasetId parameter in url cannot be empty")
    }
}