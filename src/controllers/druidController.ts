import httpStatus from "http-status";
import { ResponseHandler } from "../helpers/response";
import { httpService } from "../helpers/axios";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import routes from "../resources/routes.json";

class DruidController {
  public static getStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await httpService.get(routes.GET_STATUS.URL);
      ResponseHandler.success(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
  public static getHealthStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await httpService.get(routes.HEALTH_CHECK.URL);
      ResponseHandler.success(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
  public static executeNativeQuery = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await httpService.post(routes.NATIVE_QUERY.URL, req.body);
      ResponseHandler.success(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
  public static executeSqlQuery = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await httpService.post(routes.SQL_QUERY.URL, req.body);
      ResponseHandler.success(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
}

export default DruidController;
