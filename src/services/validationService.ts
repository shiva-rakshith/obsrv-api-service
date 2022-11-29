import {
  ICommonRules,
  IRules,
  IValidationResponse,
  IQuery,
  ISqlQuery,
  IDataSourceRules,
  IQueryTypeRules,
} from "../models";
import constants from "../resources/constants.json";
import { isEmpty, isUndefined } from "lodash";
import moment from "moment";

export class ValidationService {
  public static validateNativeQuery(
    query: IQuery,
    commonLimits: ICommonRules,
    dataSourceLimits: IDataSourceRules
  ): IValidationResponse {
    if (!isEmpty(dataSourceLimits) && !isUndefined(dataSourceLimits)) {
      this.determineQueryLimits(query, commonLimits);
      try {
        return this.validateQueryRules(
          query,
          dataSourceLimits.queryRules[query.queryType as keyof IQueryTypeRules]
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
  }

  private static validateQueryRules(
    query: IQuery,
    queryRules: IRules
  ): IValidationResponse {
    const dateRange: any = query.intervals;
    const allowedRange = queryRules.max_date_range;
    if (!isEmpty(query.intervals)) {
      const extractedDateRange = Array.isArray(dateRange)
        ? dateRange[0].split("/")
        : dateRange.toString().split("/");
      const fromDate = moment(extractedDateRange[0], "YYYY-MM-DD HH:MI:SS");
      const toDate = moment(extractedDateRange[1], "YYYY-MM-DD HH:MI:SS");
      return this.validateDateRange(fromDate, toDate, allowedRange);
    } else {
      return {
        errorMessage: constants.NO_DATE_RANGE,
        isValid: false,
      };
    }
  }

  private static determineQueryLimits(
    query: IQuery,
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
    queryData: ISqlQuery,
    commonLimits: ICommonRules,
    dataSourceLimits: IDataSourceRules
  ): IValidationResponse {
    const maxRowLimit = commonLimits.max_result_row_limit;
    if (!isEmpty(dataSourceLimits) && !isUndefined(dataSourceLimits)) {
      let vocabulary = queryData.query.split(" ");
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
        queryData.query = [vocabulary, "LIMIT", maxRowLimit].join(" ");
      } else {
        let newLimit = this.getNewRowLimit(queryLimit, maxRowLimit);
        vocabulary[queryLimitIndex + 1] = newLimit.toString();
        queryData.query = vocabulary.join(" ");
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
