import express from "express";
import { config } from "../configs/Config";
import { HTTPConnector } from "../connectors/HttpConnector";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { QueryService } from "../services/QueryService";
import { ValidationService } from "../services/ValidationService";
import { DatasetService } from "../services/DatasetService";
import { KafkaConnector } from "../connectors/KafkaConnector";
import { DataSourceService } from "../services/DataSourceService";
import { DbConnector } from "../connectors/DbConnector";
import { routesConfig } from "../configs/RoutesConfig";

const validationService = new ValidationService();

const queryService = new QueryService(new HTTPConnector(`${config.query_api.druid.host}:${config.query_api.druid.port}`));

export const kafkaConnector = new KafkaConnector(config.dataset_api.kafka.config)

export const dbConnector = new DbConnector(config.db_connector_config)

export const dataSourceService = new DataSourceService(dbConnector);

export const datasetService = new DatasetService(dbConnector, kafkaConnector);

const router = express.Router();


/**
 * Query API(s)
 */

router.post(`${routesConfig.query.native_query.path}`, ResponseHandler.setApiId(routesConfig.query.native_query.api_id), validationService.validateRequestBody, validationService.validateQuery, queryService.executeNativeQuery);
router.post(`${routesConfig.query.sql_query.path}`, ResponseHandler.setApiId(routesConfig.query.sql_query.api_id), validationService.validateRequestBody, validationService.validateQuery, queryService.executeSqlQuery);



/***
 * Dataset APIs
 */
router.post(`${routesConfig.data_ingest.path}`, ResponseHandler.setApiId(routesConfig.data_ingest.api_id), validationService.validateRequestBody, datasetService.create);


/**
 * Config API(s)
 */
router.post(`${routesConfig.config.dataset.save.path}`, ResponseHandler.setApiId(routesConfig.config.dataset.save.api_id), datasetService.save);
router.patch(`${routesConfig.config.dataset.update.path}`, ResponseHandler.setApiId(routesConfig.config.dataset.update.api_id), datasetService.update);
router.get(`${routesConfig.config.dataset.read.path}`, ResponseHandler.setApiId(routesConfig.config.dataset.read.api_id), datasetService.read);
router.post(`${routesConfig.config.dataset.list.path}`, ResponseHandler.setApiId(routesConfig.config.dataset.list.api_id), datasetService.list);
router.post(`${routesConfig.config.datasource.save.path}`, ResponseHandler.setApiId(routesConfig.config.datasource.save.api_id), dataSourceService.save);
router.patch(`${routesConfig.config.datasource.update.path}`, ResponseHandler.setApiId(routesConfig.config.datasource.update.api_id), dataSourceService.update);
router.get(`${routesConfig.config.datasource.read.path}`, ResponseHandler.setApiId(routesConfig.config.datasource.read.api_id), dataSourceService.read);



export { router };
