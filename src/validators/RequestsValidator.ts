import Ajv from "ajv";
import fs from "fs";
import httpStatus from "http-status";
import { IValidator } from "../models/DatasetModels";
import { ValidationStatus } from "../models/ValidationModels";
import { routesConfig } from "../configs/RoutesConfig";
export class RequestsValidator implements IValidator {
    private schemaBasePath: string = "/src/resources/";
    private reqSchemaMap = new Map<string, string>([
        [routesConfig.query.native_query.api_id, "QueryRequest.json"],
        [routesConfig.query.sql_query.api_id, "QueryRequest.json"],
        [routesConfig.data_ingest.api_id, "DataIngestionReq.json"]
    ]);
    private validator: Ajv;

    constructor() {
        this.validator = new Ajv()
    }
    validate(data: any, id: string): ValidationStatus {
        return this.validateRequest(data, id)
    }

    private validateRequest(data: any, id: string): ValidationStatus {
        let validRequestObj = this.validator.validate(this.getReqSchema(id), data);
        if (!validRequestObj) {
            let error = this.validator.errors;
            let errorMessage = error![0].instancePath.replace("/", "") + " " + error![0].message;
            return { error: httpStatus["400_NAME"], isValid: false, message: errorMessage, code: httpStatus[400] };
        } else {
            return { isValid: true, message: "Validation Success", code: httpStatus[200] };
        }
    };

    private getReqSchema(apiId: string): Object {
        return JSON.parse(fs.readFileSync(process.cwd() + `${this.schemaBasePath}schemas/` + `${this.reqSchemaMap.get(apiId)}`, "utf8"));
    }


}