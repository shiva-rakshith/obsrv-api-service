import express from "express";
import { config } from "../configs/Config";
import { HTTPConnector } from "../connectors/HttpConnector";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { QueryService } from "../services/QueryService";
import { ValidationService } from "../services/ValidationService";
import { DatasetService } from "../services/DatasetService";
import { KafkaConnector } from "../connectors/KafkaConnector";
import { DataSourceService } from "../services/DataSourceService";
import { DatasetSourceConfigService } from "../services/DatasetSourceConfigService";
import { DatasetTransformationService } from "../services/DatasetTranformationService";
import { DbConnector } from "../connectors/DbConnector";
import { routesConfig } from "../configs/RoutesConfig";
import { IngestorService } from "../services/IngestorService";
import { metricsHandler } from "../helpers/prometheus";

const validationService = new ValidationService();

const queryService = new QueryService(new HTTPConnector(`${config.query_api.druid.host}:${config.query_api.druid.port}`))

export const kafkaConnector = new KafkaConnector()

export const dbConnector = new DbConnector(config.db_connector_config);

export const datasourceService = new DataSourceService(dbConnector);
export const datasetService = new DatasetService(dbConnector);
export const datasetSourceConfigService = new DatasetSourceConfigService(dbConnector);
export const datasetTransformationService = new DatasetTransformationService(dbConnector);
export const ingestorService = new IngestorService(kafkaConnector);

dbConnector.init()

const router = express.Router();

/** Query API(s) */
router.post(`${routesConfig.query.native_query.path}`, ResponseHandler.setApiId(routesConfig.query.native_query.api_id), validationService.validateRequestBody, validationService.validateQuery, queryService.executeNativeQuery);
router.post(`${routesConfig.query.sql_query.path}`, ResponseHandler.setApiId(routesConfig.query.sql_query.api_id), validationService.validateRequestBody, validationService.validateQuery, queryService.executeSqlQuery);

/** Ingestor API */
router.post(`${routesConfig.data_ingest.path}`, ResponseHandler.setApiId(routesConfig.data_ingest.api_id), validationService.validateRequestBody, ingestorService.create);

/** Dataset APIs */
router.post(`${routesConfig.config.dataset.save.path}`, ResponseHandler.setApiId(routesConfig.config.dataset.save.api_id), validationService.validateRequestBody, datasetService.save);
router.patch(`${routesConfig.config.dataset.update.path}`, ResponseHandler.setApiId(routesConfig.config.dataset.update.api_id), validationService.validateRequestBody, datasetService.update);
router.get(`${routesConfig.config.dataset.preset.path}`, ResponseHandler.setApiId(routesConfig.config.dataset.preset.api_id), datasetService.preset);
router.get(`${routesConfig.config.dataset.read.path}`, ResponseHandler.setApiId(routesConfig.config.dataset.read.api_id), datasetService.read);
router.post(`${routesConfig.config.dataset.list.path}`, ResponseHandler.setApiId(routesConfig.config.dataset.list.api_id), validationService.validateRequestBody, datasetService.list);

/** Dataset Source Config APIs */
router.post(`${routesConfig.config.dataset_source_config.save.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_source_config.save.api_id), validationService.validateRequestBody, datasetSourceConfigService.save);
router.patch(`${routesConfig.config.dataset_source_config.update.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_source_config.update.api_id), validationService.validateRequestBody, datasetSourceConfigService.update);
router.get(`${routesConfig.config.dataset_source_config.preset.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_source_config.preset.api_id), datasetSourceConfigService.preset);
router.get(`${routesConfig.config.dataset_source_config.read.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_source_config.read.api_id), datasetSourceConfigService.read);
router.post(`${routesConfig.config.dataset_source_config.list.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_source_config.list.api_id), validationService.validateRequestBody, datasetSourceConfigService.list);

/**Dataset Transformation APIs*/
router.post(`${routesConfig.config.dataset_transformation.save.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_transformation.save.api_id), validationService.validateRequestBody, datasetTransformationService.save);
router.patch(`${routesConfig.config.dataset_transformation.update.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_transformation.update.api_id), validationService.validateRequestBody, datasetTransformationService.update);
router.get(`${routesConfig.config.dataset_transformation.preset.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_transformation.preset.api_id), datasetTransformationService.preset);
router.get(`${routesConfig.config.dataset_transformation.read.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_transformation.read.api_id), datasetTransformationService.read);
router.post(`${routesConfig.config.dataset_transformation.list.path}`, ResponseHandler.setApiId(routesConfig.config.dataset_transformation.list.api_id), validationService.validateRequestBody, datasetTransformationService.list);

/** DataSource API(s) */
router.post(`${routesConfig.config.datasource.save.path}`, ResponseHandler.setApiId(routesConfig.config.datasource.save.api_id), validationService.validateRequestBody, datasourceService.save);
router.patch(`${routesConfig.config.datasource.update.path}`, ResponseHandler.setApiId(routesConfig.config.datasource.update.api_id), validationService.validateRequestBody, datasourceService.update);
router.get(`${routesConfig.config.datasource.preset.path}`, ResponseHandler.setApiId(routesConfig.config.datasource.preset.api_id), datasourceService.preset);
router.get(`${routesConfig.config.datasource.read.path}`, ResponseHandler.setApiId(routesConfig.config.datasource.read.api_id), datasourceService.read);
router.post(`${routesConfig.config.datasource.list.path}`, ResponseHandler.setApiId(routesConfig.config.datasource.list.api_id), validationService.validateRequestBody, datasourceService.list);

// Prometheus metrics endpoint
router.get(routesConfig.prometheus.path, metricsHandler)

export { router };