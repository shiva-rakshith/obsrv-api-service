import {
  ICommonRules,
  IRules,
  IValidationResponse,
  INativeQuery,
  IDataSourceRules,
  IQueryTypeRules,
} from "../models";
import constants from "../resources/constants.json";
import { isEmpty, isUndefined } from "lodash";
import moment from "moment";
import fs from "fs";
import Ajv from "ajv";

export class ValidationService {
  public static validateNativeQuery(
    query: INativeQuery,
    commonLimits: ICommonRules,
    dataSourceLimits: IDataSourceRules
  ): IValidationResponse {
    let nativeQuerySchema = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/configs/nativeQuerySchema.json",
        "utf8"
      )
    );
    let ajv = new Ajv();
    let isValidQuery = ajv.validate(
      nativeQuerySchema,
      JSON.parse(JSON.stringify(query))
    );
    if (isValidQuery) {
      if (!isEmpty(dataSourceLimits) && !isUndefined(dataSourceLimits)) {
        this.determineQueryLimits(query, commonLimits);
        try {
          return this.validateQueryRules(
            query,
            dataSourceLimits.queryRules[
              query.queryType as keyof IQueryTypeRules
            ]
          );
        } catch (error) {
          return { errorMessage: constants.INVALID_QUERY_TYPE, isValid: false };
        }
      } else {
        return {
          errorMessage: constants.INVALID_DATA_SOURCE,
          isValid: false,
        };
      }
    } else {
      let error = ajv.errors;
      let message =
        error![0].instancePath.replace("/", "") + " " + error![0].message;
      return { errorMessage: message, isValid: false };
    }
  }

  private static validateQueryRules(
    query: INativeQuery,
    queryRules: IRules
  ): IValidationResponse {
    const dateRange: any = query.intervals;
    const allowedRange = queryRules.max_date_range;
    const extractedDateRange = Array.isArray(dateRange)
      ? dateRange[0].split("/")
      : dateRange.toString().split("/");
    const fromDate = moment(extractedDateRange[0], "YYYY-MM-DD HH:MI:SS");
    const toDate = moment(extractedDateRange[1], "YYYY-MM-DD HH:MI:SS");
    return this.validateDateRange(fromDate, toDate, allowedRange);
  }

  private static determineQueryLimits(
    query: INativeQuery,
    limits: ICommonRules
  ): void {
    if (query.threshold) {
      query.threshold = this.getNewRowLimit(
        query.threshold,
        limits.max_result_threshold
      );
    } else {
      query.threshold = limits.max_result_threshold;
    }
    if (query.limit) {
      query.limit = this.getNewRowLimit(
        query.limit,
        limits.max_result_row_limit
      );
    } else {
      query.limit = limits.max_result_row_limit;
    }
  }

  public static validateSqlQuery(
    queryData: string,
    commonLimits: ICommonRules,
    dataSourceLimits: IDataSourceRules
  ): IValidationResponse {
    const maxRowLimit = commonLimits.max_result_row_limit;
    if (!isEmpty(dataSourceLimits) && !isUndefined(dataSourceLimits)) {
      let vocabulary = queryData.split(" ");
      let queryLimitIndex = vocabulary.indexOf("LIMIT");
      let fromDateIndex = vocabulary.indexOf("TIMESTAMP");
      let toDateIndex = vocabulary.lastIndexOf("TIMESTAMP");
      let fromDate = moment(
        vocabulary[fromDateIndex + 1],
        "YYYY-MM-DD HH:MI:SS"
      );
      let toDate = moment(vocabulary[toDateIndex + 1], "YYYY-MM-DD HH:MI:SS");
      let queryLimit = Number(vocabulary[queryLimitIndex + 1]);
      const allowedRange = dataSourceLimits.queryRules.scan.max_date_range;
      if (isNaN(queryLimit)) {
        queryData = [vocabulary, "LIMIT", maxRowLimit].join(" ");
      } else {
        let newLimit = this.getNewRowLimit(queryLimit, maxRowLimit);
        vocabulary[queryLimitIndex + 1] = newLimit.toString();
        queryData = vocabulary.join(" ");
      }
      if (fromDate.isValid() && toDate.isValid()) {
        return this.validateDateRange(fromDate, toDate, allowedRange);
      } else {
        return {
          errorMessage: constants.NO_DATE_RANGE,
          isValid: false,
        };
      }
    } else {
      return {
        errorMessage: constants.INVALID_DATA_SOURCE,
        isValid: false,
      };
    }
  }

  private static validateDateRange(
    fromDate: moment.Moment,
    toDate: moment.Moment,
    allowedRange: Number = 0
  ) {
    const differenceInDays = Math.abs(fromDate.diff(toDate, "days"));
    if (differenceInDays > allowedRange) {
      return {
        errorMessage: constants.INVALID_DATE_RANGE.replace(
          "${allowedRange}",
          allowedRange.toString()
        ),
        isValid: false,
      };
    } else {
      return { isValid: true };
    }
  }

  private static getNewRowLimit(queryLimit: number, maxRowLimit: number = 0) {
    return queryLimit > maxRowLimit ? maxRowLimit : queryLimit || maxRowLimit;
  }
}
