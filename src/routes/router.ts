import express from 'express'
import druidController from '../controllers/druidController'
import routes from '../resources/routes.json'
import validate from '../middlewares/validators/druidValidator'
import setApiId from '../middlewares/utils/apiId'

const router = express.Router()

router.get(routes.GETSTATUS.URL, setApiId(routes.GETSTATUS.APIID), druidController.getStatus)

router.get(routes.HEALTHCHECK.URL, setApiId(routes.HEALTHCHECK.APIID),druidController.getHealthStatus)

router.get(routes.LISTDATSOURCES.URL, setApiId(routes.LISTDATSOURCES.APIID),druidController.listDataSources)

router.post(routes.NATIVEQUERY.URL, setApiId(routes.NATIVEQUERY.APIID),validate({"isSqlQuery":false}), druidController.executeNativeQuery)

router.post(routes.SQLQUERY.URL, setApiId(routes.SQLQUERY.APIID),validate({"isSqlQuery":true}), druidController.executeSqlQuery)

export {router}