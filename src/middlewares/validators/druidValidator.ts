import { NextFunction, Request, Response } from "express";
import { IValidationResponse } from "../../models";
import { ValidationService } from "../../services/validationService";
import { config } from "../../config/config";
import createError from "http-errors";
import httpStatus from "http-status";

const limits = config.limits;

const validate =
  (configParams: Record<string, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const queryPayload = req.body;
    const isSqlQuery = configParams.isSqlQuery;
    let dataSource, result: IValidationResponse;
    if (isSqlQuery) {
      queryPayload.query = queryPayload.query.replace(/\s+/g, " ").trim();
      dataSource = getDataSource(queryPayload.query);
      result = ValidationService.validateSqlQuery(
        queryPayload,
        getLimits(dataSource)
      );
    } else {
      dataSource = queryPayload.dataSource;
      result = ValidationService.validateNativeQuery(
        queryPayload,
        getLimits(dataSource)
      );
    }

    if (!result.isValid) {
      throw createError(httpStatus.BAD_REQUEST, result.errorMessage!);
    }

    next();
  };

const getLimits = (datasource: string): any => {
  for (var index = 0; index < limits.length; index++) {
    if (limits[index].dataSource == datasource) {
      return limits[index];
    }
  }
};

const getDataSource = (query: string): string => {
  let dataSource = query.substring(query.indexOf("FROM")).split(" ")[1];
  return dataSource.replace(/"/g, "");
};

export default validate;
