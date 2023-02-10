import express from "express";
import { config } from "../configs/Config";
import { HTTPConnector } from "../connectors/HttpConnector";
import { PostgresConnector } from "../connectors/PostgresConnector";
import { IngestionSchemaV2 } from "../generators/IngestionSchema";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { IngestionConfig } from "../models/IngestionModels";
import { QueryService } from "../services/QueryService";
import { SchemaGeneratorService } from "../services/SchemaGeneratorService";
import { ValidationService } from "../services/ValidationService";
import routes from "./routesConfig";

const validationService = new ValidationService();

const queryService = new QueryService(new HTTPConnector(`${config.query_api.druid.host}:${config.query_api.druid.port}`));

const schemaGeneratorService = new SchemaGeneratorService(new PostgresConnector(config.postgres.pg_config));

const router = express.Router();


/**
 * Query Service Routes
 */

router.post(`${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.NATIVE_QUERY.URL}`, ResponseHandler.setApiId(routes.QUERY.NATIVE_QUERY.API_ID), validationService.validateRequestBody, validationService.validateConfiguration, validationService.validateNativeQuery, queryService.executeNativeQuery);
router.post(`${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.SQL_QUERY.URL}`, ResponseHandler.setApiId(routes.QUERY.SQL_QUERY.API_ID), validationService.validateRequestBody, validationService.validateConfiguration, validationService.validateSqlQuery, queryService.executeSqlQuery);


/**
 * Generator Service Routes
 */
router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SCHEMA.INGESTION_SCHEMA.URL}`, ResponseHandler.setApiId(routes.SCHEMA.INGESTION_SCHEMA.API_ID), validationService.validateRequestBody, schemaGeneratorService.generateIngestionSchema);
router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SCHEMA.DATASET_SCHEMA.URL}`, ResponseHandler.setApiId(routes.SCHEMA.DATASET_SCHEMA.API_ID), validationService.validateRequestBody, schemaGeneratorService.generateDataSetSchema);


/**
 * 
 * Dataset service routers
 * 
 */

// const ingestionConfig = {
//     "dataSet": "obsrv-telemetry-events",
//     "indexCol": "ets",
//     "granularitySpec": {
//         "segmentGranularity": "DAY",
//         "queryGranularity": "HOUR",
//         "rollup": false
//     },
//     "tuningConfig": {
//         "maxRowPerSegment": 50000,
//         "taskCount": 1
//     },
//     "ioConfig": {
//         "topic": "obsrv.telemetry.input",
//         "bootstrapIp": "localhost:9092",
//         "taskDuration": "PT8H"
//     }
// }
// const ingestionSchemaV2 =  new IngestionSchemaV2("telemetry-raw", <IngestionConfig>ingestionConfig)
// //const sample = {"type":"object","properties":{"eid":{"type":"integer"},"ver":{"type":"string"},"syncts":{"type":"integer"},"ets":{"type":"integer"},"flags":{"type":"object","properties":{"pp_validation_processed":{"type":"boolean"},"pp_duplicate":{"type":"boolean"},"device_denorm":{"type":"boolean"},"dialcode_denorm":{"type":"boolean"},"content_denorm":{"type":"boolean"}},"required":["pp_validation_processed","pp_duplicate","device_denorm","dialcode_denorm","content_denorm"]},"dialcodedata":{"type":"object","properties":{"identifier":{"type":"string"},"channel":{"type":"string"},"publisher":{"type":"string"},"status":{"type":"integer"}},"required":["identifier","channel","publisher","status"]},"mid":{"type":"string"},"type":{"type":"string"},"tags":{"type":"array","items":{"type":"string"}},"actor":{"type":"object","properties":{"id":{"type":"string"},"type":{"type":"string"}},"required":["id","type"]},"edata":{"type":"object","properties":{"topn":{"type":"array","items":{"type":"object","properties":{"identifier":{"type":"string"}},"required":["identifier"]}},"query":{"type":"string"},"size":{"type":"integer"},"type":{"type":"string"},"filters":{"type":"object","properties":{"contentType":{"type":"array","items":{"type":"string"}},"mimeType":{"type":"object"},"resourceType":{"type":"object"},"status":{"type":"array","items":{"type":"string"}},"objectType":{"type":"array","items":{"type":"string"}},"dialcodes":{"type":"string"},"framework":{"type":"object"},"compatibilityLevel":{"type":"object","properties":{"max":{"type":"integer"},"min":{"type":"integer"}},"required":["max","min"]},"channel":{"type":"object","properties":{"ne":{"type":"array","items":{"type":"string"}}},"required":["ne"]}},"required":["contentType","mimeType","resourceType","status","objectType","dialcodes","framework","compatibilityLevel","channel"]},"sort":{"type":"object"}},"required":["topn","query","size","type","filters","sort"]},"@timestamp":{"type":"string","format":"date-time"},"context":{"type":"object","properties":{"pdata":{"type":"object","properties":{"ver":{"type":"string"},"id":{"type":"string"},"pid":{"type":"string"}},"required":["ver","id","pid"]},"did":{"type":"string"},"env":{"type":"string"},"channel":{"type":"string"}},"required":["pdata","did","env","channel"]},"@version":{"type":"string"},"object":{"type":"object","properties":{"id":{"type":"string"},"type":{"type":"string"}},"required":["id","type"]}},"required":["eid","ver","syncts","ets","flags","dialcodedata","mid","type","tags","actor","edata","@timestamp","context","@version","object"]}
// const json = '{"type":"object","properties":{"eid":{"type":"integer"},"ver":{"type":"string"},"syncts":{"type":"integer"},"ets":{"type":"integer"},"flags":{"type":"object","properties":{"pp_validation_processed":{"type":"boolean"},"pp_duplicate":{"type":"boolean"},"device_denorm":{"type":"boolean"},"dialcode_denorm":{"type":"boolean"},"content_denorm":{"type":"boolean"}},"required":["pp_validation_processed","pp_duplicate","device_denorm","dialcode_denorm","content_denorm"]},"dialcodedata":{"type":"object","properties":{"identifier":{"type":"string"},"channel":{"type":"string"},"publisher":{"type":"string"},"status":{"type":"integer"}},"required":["identifier","channel","publisher","status"]},"mid":{"type":"string"},"type":{"type":"string"},"tags":{"type":"array","items":{"type":"string"}},"actor":{"type":"object","properties":{"id":{"type":"string"},"type":{"type":"string"}},"required":["id","type"]},"edata":{"type":"object","properties":{"topn":{"type":"array","items":{"type":"object","properties":{"identifier":{"type":"string"}},"required":["identifier"]}},"query":{"type":"string"},"size":{"type":"integer"},"type":{"type":"string"},"filters":{"type":"object","properties":{"contentType":{"type":"array","items":{"type":"string"}},"mimeType":{"type":"object"},"resourceType":{"type":"object"},"status":{"type":"array","items":{"type":"string"}},"objectType":{"type":"array","items":{"type":"string"}},"dialcodes":{"type":"string"},"framework":{"type":"object"},"compatibilityLevel":{"type":"object","properties":{"max":{"type":"integer"},"min":{"type":"integer"}},"required":["max","min"]},"channel":{"type":"object","properties":{"ne":{"type":"array","items":{"type":"string"}}},"required":["ne"]}},"required":["contentType","mimeType","resourceType","status","objectType","dialcodes","framework","compatibilityLevel","channel"]},"sort":{"type":"object"}},"required":["topn","query","size","type","filters","sort"]},"@timestamp":{"type":"string","format":"date-time"},"context":{"type":"object","properties":{"pdata":{"type":"object","properties":{"ver":{"type":"string"},"id":{"type":"string"},"pid":{"type":"string"}},"required":["ver","id","pid"]},"did":{"type":"string"},"env":{"type":"string"},"channel":{"type":"string"}},"required":["pdata","did","env","channel"]},"@version":{"type":"string"},"object":{"type":"object","properties":{"id":{"type":"string"},"type":{"type":"string"}},"required":["id","type"]}},"required":["eid","ver","syncts","ets","flags","dialcodedata","mid","type","tags","actor","edata","@timestamp","context","@version","object"]}'
// const map = new Map(Object.entries(JSON.parse(json)));
// ingestionSchemaV2.generate(map)
export { router };
