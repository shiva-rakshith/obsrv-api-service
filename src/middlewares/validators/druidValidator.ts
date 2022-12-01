import Ajv from "ajv";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { IValidationResponse } from "../../models";
import { ValidationService } from "../../services/validationService";
import { config } from "../../configs/config";
import createError from "http-errors";
import httpStatus from "http-status";
import { create } from "lodash";

const limits = config.limits;
let requestBodySchema = JSON.parse(
  fs.readFileSync(process.cwd() + "/src/configs/requestBodySchema.json", "utf8")
);

const validate =
  (configParams: Record<string, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const queryPayload = req.body;
    let ajv = new Ajv();
    let validRequestObj = ajv.validate(
      requestBodySchema,
      JSON.parse(JSON.stringify(queryPayload))
    );
    if (validRequestObj) {
      const isSqlQuery = configParams.isSqlQuery;
      let dataSource, result: IValidationResponse;
      if (isSqlQuery) {
        queryPayload.querySql = queryPayload.querySql
          .replace(/\s+/g, " ")
          .trim();
        dataSource = getDataSource(queryPayload.querySql);
        result = ValidationService.validateSqlQuery(
          queryPayload.querySql,
          limits.common,
          getLimits(dataSource)
        );
      } else {
        dataSource = queryPayload.query.dataSource;
        result = ValidationService.validateNativeQuery(
          queryPayload.query,
          limits.common,
          getLimits(dataSource)
        );
      }
      if (!result.isValid) {
        throw createError(httpStatus.BAD_REQUEST, result.errorMessage!);
      }
    } else {
      let error = ajv.errors;
      let errorMessage =
        error![0].instancePath.replace("/", "") + " " + error![0].message;
      throw createError(httpStatus.BAD_REQUEST, errorMessage);
    }
    next();
  };

const getLimits = (datasource: string): any => {
  for (var index = 0; index < limits.rules.length; index++) {
    if (limits.rules[index].dataSource == datasource) {
      return limits.rules[index];
    }
  }
};

const getDataSource = (query: string): string => {
  let dataSource = query.substring(query.indexOf("FROM")).split(" ")[1];
  return dataSource.replace(/"/g, "");
};
export default validate;
