import httpStatus from "http-status";
import { ResponseHandler } from "../helpers/responseHandler";
import { httpService } from "../helpers/httpService";
import { Request, Response, NextFunction } from "express";
import errorResponse from "http-errors";
import { config } from "../configs/config";
import _ from "lodash";
import { IngestionConfig, IngestionSchema } from "../generators/IngestionSchema";
const responseHandler = new ResponseHandler();

class DruidController {
  public getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await httpService.get(config.druidStatusEndPoint);
      responseHandler.successResponse(req, res, { status: result.status, data: result.data });
    } catch (error: any) {
      next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };

  public getHealthStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await httpService.get(config.druidHealthEndPoint);
      responseHandler.successResponse(req, res, { status: result.status, data: result.data });
    } catch (error: any) {
      next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };

  public executeNativeQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var result = await httpService.post(config.druidNativeQueryEndPoint, req.body.query);
      var mergedResult = result.data;
      if (req.body.query.queryType === "scan" && result.data) {
        mergedResult = result.data.map((item: Record<string, any>) => {
          return item.events;
        });
      }
      responseHandler.successResponse(req, res, { status: result.status, data: _.flatten(mergedResult) });
    } catch (error: any) {
      next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };

  public executeSqlQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await httpService.post(config.druidSqlQueryEndPoint, req.body.querySql);
      responseHandler.successResponse(req, res, { status: result.status, data: result.data });
    } catch (error: any) {
      next(errorResponse(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
  };

  public generateIngestionSpec = async (req: Request, res: Response, next: NextFunction) => {

    const datasource = req.body.dataSource 
    const indexCol = req.body.indexCol
    const config = req.body.config
    const sample = req.body.data
    
    const ingestionSpec = new IngestionSchema(datasource, indexCol, <IngestionConfig>config)
    const spec = ingestionSpec.generate(sample)
    responseHandler.successResponse(req, res, { status: 200, data: spec });
  }



}

export default DruidController;
