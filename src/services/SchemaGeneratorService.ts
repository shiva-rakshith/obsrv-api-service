import { NextFunction, Request, Response } from "express";
import { DataSetSchema } from "../generators/DataSetSchema";
import { IngestionConfig } from "../generators/IngestionSchema";
import { IngestionSchemaV2 } from "../generators/IngestionSchemaV2";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { DataSchemeRequest, IConnector, IngestionSchemeRequest } from "../models/IngestionModels";
export class SchemaGeneratorService {
    private connector: IConnector;
    constructor(connector: IConnector) {
        this.connector = connector
        this.connector.connect();
    }
    public generateIngestionSchema = async (req: Request, res: Response, next: NextFunction) => {
        const request = <IngestionSchemeRequest>req.body
        console.log("request " + JSON.stringify(request.config.dataSet))
        
        const schema = new IngestionSchemaV2(request.config.dataSet, <IngestionConfig>request.config)
        const sample = new Map(Object.entries(request.data));
        const spec = schema.generate(sample)
        //console.log("spec " + JSON.stringify(spec))
        //const ress =  this.connector.execute(`INSERT INTO dataset_config (dataset_name, dataset_version, ingestion_schema, dataset_schema) VALUES (${request.config.dataSet}, 'v1', ${spec}, '{}')`)
        // ress.then((resss: { rows: any; }) => {
        //     console.log("data " + JSON.stringify(resss.rows))
        // })
        ResponseHandler.successResponse(req, res, { status: 200, data: spec });
    }

    public generateDataSetSchema = async (req: Request, res: Response, next: NextFunction) => {
        const request = <DataSchemeRequest>req.body
        const schema = new DataSetSchema(request.config.dataSet, new Map())
        const spec = schema.generate(request.data)
        // const ress =  this.connector.execute(`INSERT INTO dataset_config (dataset_name, dataset_version, ingestion_schema, dataset_schema) VALUES (${request.config.dataSet}, 'v1', {}, ${spec})`)
        // ress.then((resss: { rows: any; }) => {
        //     console.log("data " + JSON.stringify(resss.rows))
        // })
        ResponseHandler.successResponse(req, res, { status: 200, data: spec });
    }

}