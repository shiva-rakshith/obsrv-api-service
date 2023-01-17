import express from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { QueryService } from "../services/QueryService";
import { SchemaGeneratorService } from "../services/SchemaGeneratorService";
import { ValidationService } from "../services/ValidationService";
import routes from "./routesConfig";
const queryService = new QueryService();
const schemaGeneratorService = new SchemaGeneratorService();

const router = express.Router();
const responseHandler = new ResponseHandler();
const validationService = new ValidationService("/src/configs/");

/**
 * Query Service Routers
 */

// router.get(routes.GET_STATUS.URL, responseHandler.setApiId(routes.GET_STATUS.API_ID), druidController.getStatus);

// router.get(routes.HEALTH_CHECK.URL, responseHandler.setApiId(routes.HEALTH_CHECK.API_ID), druidController.getHealthStatus);

// router.post(routes.NATIVE_QUERY.URL, responseHandler.setApiId(routes.NATIVE_QUERY.API_ID), validationService.validateRequestBody, validationService.validateConfiguration, validationService.validateNativeQuery, druidController.executeNativeQuery);

// router.post(routes.SQL_QUERY.URL, responseHandler.setApiId(routes.SQL_QUERY.API_ID), validationService.validateRequestBody, validationService.validateConfiguration, validationService.validateSqlQuery, druidController.executeSqlQuery);

/**
 * Query Service Routes
 */

router.post(`${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.NATIVE_QUERY.URL}`, responseHandler.setApiId(routes.QUERY.NATIVE_QUERY.API_ID), validationService.validateRequestBody, validationService.validateConfiguration, validationService.validateNativeQuery, queryService.executeNativeQuery);
router.post(`${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.SQL_QUERY.URL}`, responseHandler.setApiId(routes.QUERY.SQL_QUERY.API_ID), validationService.validateRequestBody, validationService.validateConfiguration, validationService.validateSqlQuery, queryService.executeSqlQuery);


/**
 * Generator Service Routes
 */
router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SCHEMA.INGESTION_SCHEMA.URL}`, responseHandler.setApiId(routes.SCHEMA.INGESTION_SCHEMA.API_ID), schemaGeneratorService.generateIngestionSchema);
router.post(`${routes.SCHEMA.BASE_PATH}${routes.SCHEMA.API_VERSION}${routes.SCHEMA.DATASET_SCHEMA.URL}`, responseHandler.setApiId(routes.SCHEMA.DATASET_SCHEMA.API_ID), schemaGeneratorService.generateDataSetSchema);


/**
 * 
 * Dataset service routers
 * 
 */



export { router };
