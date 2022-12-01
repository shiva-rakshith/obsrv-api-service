import httpStatus from "http-status";
import { ResponseHandler } from "../helpers/responseHandler";
import { httpService } from "../helpers/axios";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import routes from "../resources/routes.json";
const responseHandler = new ResponseHandler();

class DruidController {
  public getStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await httpService.get(routes.GET_STATUS.URL);
      responseHandler.success(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
  public getHealthStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await httpService.get(routes.HEALTH_CHECK.URL);
      responseHandler.success(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
  public executeNativeQuery = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await httpService.post(routes.NATIVE_QUERY.URL, req.body.query);
      responseHandler.success(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
  public executeSqlQuery = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await httpService.post(routes.SQL_QUERY.URL, req.body.query);
      responseHandler.success(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
}

export default DruidController;
