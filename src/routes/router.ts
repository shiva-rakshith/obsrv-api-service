import express from "express";
import DruidController from "../controllers/druidController";
import routes from "../resources/routes.json";
import validate from "../middlewares/validators/druidValidator";
import setApiId from "../middlewares/utils/apiId";

const router = express.Router();

router.get(
  routes.GETSTATUS.URL,
  setApiId(routes.GETSTATUS.APIID),
  DruidController.getStatus
);

router.get(
  routes.HEALTHCHECK.URL,
  setApiId(routes.HEALTHCHECK.APIID),
  DruidController.getHealthStatus
);

router.get(
  routes.LISTDATSOURCES.URL,
  setApiId(routes.LISTDATSOURCES.APIID),
  DruidController.listDataSources
);

router.post(
  routes.NATIVEQUERY.URL,
  setApiId(routes.NATIVEQUERY.APIID),
  validate({ isSqlQuery: false }),
  DruidController.executeNativeQuery
);

router.post(
  routes.SQLQUERY.URL,
  setApiId(routes.SQLQUERY.APIID),
  validate({ isSqlQuery: true }),
  DruidController.executeSqlQuery
);

export { router };
