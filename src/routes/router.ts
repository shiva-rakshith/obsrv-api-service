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
import { ValidationServiceV2 } from "../services/ValidationServiceV2";
import routes from "./routesConfig";

const validationService = new ValidationService();
const validationServiceV2 = new ValidationServiceV2();

const queryService = new QueryService(new HTTPConnector(`${config.query_api.druid.host}:${config.query_api.druid.port}`));

const schemaGeneratorService = new SchemaGeneratorService(new PostgresConnector(config.postgres.pg_config));

const router = express.Router();


/**
 * Query Service Routes
 */

router.post(`${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.NATIVE_QUERY.URL}`, ResponseHandler.setApiId(routes.QUERY.NATIVE_QUERY.API_ID), validationServiceV2.validateRequestBody,  validationServiceV2.validateQuery, queryService.executeNativeQuery);
router.post(`${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.SQL_QUERY.URL}`, ResponseHandler.setApiId(routes.QUERY.SQL_QUERY.API_ID), validationServiceV2.validateRequestBody,  validationServiceV2.validateQuery, queryService.executeSqlQuery);


/**
 * Generator Service Routes
 */
router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SCHEMA.INGESTION_SCHEMA.URL}`, ResponseHandler.setApiId(routes.SCHEMA.INGESTION_SCHEMA.API_ID), validationServiceV2.validateRequestBody, schemaGeneratorService.generateIngestionSchema);
router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SCHEMA.DATASET_SCHEMA.URL}`, ResponseHandler.setApiId(routes.SCHEMA.DATASET_SCHEMA.API_ID), validationServiceV2.validateRequestBody, schemaGeneratorService.generateDataSetSchema);

/**
 * System Configuration labels API
 * 
 */

router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SYSTEM_SETTINGS.CONFIG_LABEL.URL}`, ResponseHandler.setApiId(routes.SYSTEM_SETTINGS.CONFIG_LABEL.API_ID), );




/**
 * 
 * Dataset service routers
 * 
 */


export { router };
