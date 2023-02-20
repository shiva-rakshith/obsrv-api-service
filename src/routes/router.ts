import express from "express";
import { config } from "../configs/Config";
import { HTTPConnector } from "../connectors/HttpConnector";
import { PostgresConnector } from "../connectors/PostgresConnector";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { QueryService } from "../services/QueryService";
import { SchemaGeneratorService } from "../services/SchemaGeneratorService";
import { ValidationService } from "../services/ValidationService";
import routes from "./RoutesConfig";

const validationService = new ValidationService();

const queryService = new QueryService(new HTTPConnector(`${config.query_api.druid.host}:${config.query_api.druid.port}`));

const schemaGeneratorService = new SchemaGeneratorService(new PostgresConnector(config.postgres.pg_config));

const router = express.Router();


/**
 * Query API(s)
 */

router.post(`${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.NATIVE_QUERY.URL}`, ResponseHandler.setApiId(routes.QUERY.NATIVE_QUERY.API_ID), validationService.validateRequestBody, validationService.validateQuery, queryService.executeNativeQuery);
router.post(`${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.SQL_QUERY.URL}`, ResponseHandler.setApiId(routes.QUERY.SQL_QUERY.API_ID), validationService.validateRequestBody, validationService.validateQuery, queryService.executeSqlQuery);


/**
 * Schema Generator API(s)
 */
router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SCHEMA.INGESTION_SCHEMA.URL}`, ResponseHandler.setApiId(routes.SCHEMA.INGESTION_SCHEMA.API_ID), validationService.validateRequestBody, schemaGeneratorService.generateIngestionSchema);
router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SCHEMA.DATASET_SCHEMA.URL}`, ResponseHandler.setApiId(routes.SCHEMA.DATASET_SCHEMA.API_ID), validationService.validateRequestBody, schemaGeneratorService.generateDataSetSchema);

/**
 * System Configuration labels API
 */

router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SYSTEM_SETTINGS.CONFIG_LABEL.URL}`, ResponseHandler.setApiId(routes.SYSTEM_SETTINGS.CONFIG_LABEL.API_ID),);



/**
 * Config API(s)
 */


export { router };
