import express from "express";
import DruidController from "../controllers/druidController";
import routes from "../resources/routes.json";
import { ValidationService } from "../services/validationService";
import { ResponseHandler } from "../helpers/responseHandler";
const druidController = new DruidController();
const router = express.Router();
const responseHandler = new ResponseHandler();
const validationService = new ValidationService("/src/configs/");

router.get(routes.GET_STATUS.URL, responseHandler.setApiId(routes.GET_STATUS.API_ID), druidController.getStatus);

router.get(routes.HEALTH_CHECK.URL, responseHandler.setApiId(routes.HEALTH_CHECK.API_ID), druidController.getHealthStatus);

router.post(routes.NATIVE_QUERY.URL, responseHandler.setApiId(routes.NATIVE_QUERY.API_ID), validationService.validateRequestBody, validationService.validateConfiguration, validationService.validateNativeQuery, druidController.executeNativeQuery);

router.post(routes.SQL_QUERY.URL, responseHandler.setApiId(routes.SQL_QUERY.API_ID), validationService.validateRequestBody, validationService.validateConfiguration, validationService.validateSqlQuery, druidController.executeSqlQuery);

export { router };
