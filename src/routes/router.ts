import express from "express";
import DruidController from "../controllers/druidController";
import routes from "../resources/routes.json";
import validate from "../middlewares/validators/druidValidator";
import { ResponseHandler } from "../helpers/responseHandler";
const druidController = new DruidController();
const router = express.Router();
const responseHandler = new ResponseHandler();

router.get(
  routes.GET_STATUS.URL,
  responseHandler.setApiId(routes.GET_STATUS.API_ID),
  druidController.getStatus
);

router.get(
  routes.HEALTH_CHECK.URL,
  responseHandler.setApiId(routes.HEALTH_CHECK.API_ID),
  druidController.getHealthStatus
);

router.post(
  routes.NATIVE_QUERY.URL,
  responseHandler.setApiId(routes.NATIVE_QUERY.API_ID),
  validate({ isSqlQuery: false }),
  druidController.executeNativeQuery
);

router.post(
  routes.SQL_QUERY.URL,
  responseHandler.setApiId(routes.SQL_QUERY.API_ID),
  validate({ isSqlQuery: true }),
  druidController.executeSqlQuery
);

export { router };
