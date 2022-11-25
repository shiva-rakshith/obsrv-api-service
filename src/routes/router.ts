import express from "express";
import DruidController from "../controllers/druidController";
import routes from "../resources/routes.json";
import validate from "../middlewares/validators/druidValidator";
import setApiId from "../middlewares/utils/apiId";

const router = express.Router();

router.get(
  routes.GET_STATUS.URL,
  setApiId(routes.GET_STATUS.API_ID),
  DruidController.getStatus
);

router.get(
  routes.HEALTH_CHECK.URL,
  setApiId(routes.HEALTH_CHECK.API_ID),
  DruidController.getHealthStatus
);

router.post(
  routes.NATIVE_QUERY.URL,
  setApiId(routes.NATIVE_QUERY.API_ID),
  validate({ isSqlQuery: false }),
  DruidController.executeNativeQuery
);

router.post(
  routes.SQL_QUERY.URL,
  setApiId(routes.SQL_QUERY.API_ID),
  validate({ isSqlQuery: true }),
  DruidController.executeSqlQuery
);

export { router };
