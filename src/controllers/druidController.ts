import httpStatus from "http-status";
import { ApiResponse } from "../helpers/response";
import { druidInstance } from "../helpers/axios";
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
      const result = await druidInstance.get(routes.GETSTATUS.URL);
      ApiResponse.handler(req, res, result);
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
      const result = await druidInstance.get(routes.HEALTHCHECK.URL);
      ApiResponse.handler(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
  public static listDataSources = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await druidInstance.get(routes.LISTDATSOURCES.URL);
      ApiResponse.handler(req, res, result);
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
      const result = await druidInstance.post(routes.NATIVEQUERY.URL, req.body);
      ApiResponse.handler(req, res, result);
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
      const result = await druidInstance.post(routes.SQLQUERY.URL, req.body);
      ApiResponse.handler(req, res, result);
    } catch (error: any) {
      next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };
}

export default DruidController;
