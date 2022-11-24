import {
  ICommon,
  ILimits,
  IRules,
  IValidationResponse,
  IQuery,
  IString,
} from "../models";
import constants from "../resources/constants.json";

class ValidationService {
  public static validateNativeQuery(
    query: IQuery,
    limits: ILimits
  ): IValidationResponse {
    if (limits != undefined && limits) {
      this.validateCommonRules(query, limits.common);
      switch (query.queryType) {
        case "groupBy":
          return this.validateQueryTypes(query, limits.queryRules.groupBy);
        case "topN":
          return this.validateQueryTypes(query, limits.queryRules.topN);
        case "scan":
          return this.validateQueryTypes(query, limits.queryRules.scan);
        case "search":
          return this.validateQueryTypes(query, limits.queryRules.search);
        case "timeseries":
          return this.validateQueryTypes(query, limits.queryRules.timeseries);
        case "timeBoundary":
          return this.validateQueryTypes(query, limits.queryRules.timeBoundary);
        default:
          return { isValid: true };
      }
    } else {
      return { isValid: true };
    }
  }

  private static validateQueryTypes(
    query: IQuery,
    queryRules: IRules
  ): IValidationResponse {
    return this.validateDateRange(query.intervals, queryRules.max_date_range);
  }

  private static validateDateRange(
    dateRange: string[] | string = "",
    allowedRange: Number = 0
  ): IValidationResponse {
    if (dateRange) {
      const extracted = Array.isArray(dateRange)
        ? dateRange[0].split("/")
        : dateRange.toString().split("/");
      const fromDate = new Date(extracted[0]).getTime();
      const toDate = new Date(extracted[1]).getTime();
      const diffInDays = (toDate - fromDate) / (1000 * 3600 * 24);
      if (diffInDays > allowedRange) {
        return {
          errorMessage: constants.invalidDateRange.replace(
            "${allowedRange}",
            allowedRange.toString()
          ),
          isValid: false,
        };
      } else {
        return { isValid: true };
      }
    } else {
      return {
        errorMessage: constants.noDataRange,
        isValid: false,
      };
    }
  }

  private static validateCommonRules(query: IQuery, limits: ICommon): void {
    if (query.threshold) {
      query.threshold =
        query.threshold > limits.max_result_threshold
          ? limits.max_result_threshold
          : query.threshold || limits.max_result_threshold;
    } else {
      query.threshold = limits.max_result_threshold;
    }
    if (query.limit) {
      query.limit =
        query.limit > limits.max_result_row_limit
          ? limits.max_result_row_limit
          : query.limit || limits.max_result_row_limit;
    } else {
      query.limit = limits.max_result_row_limit;
    }
  }
  public static validateSqlQuery(
    queryData: IString,
    limits: ILimits
  ): IValidationResponse {
    if (limits != undefined && limits) {
      const isDateMentioned = queryData.query.indexOf("TIMESTAMP");
      this.validateSqlLimits(queryData, limits.common.max_result_row_limit);
      const allowedRange = limits.queryRules.scan.max_date_range || 0;
      if (isDateMentioned != -1) {
        let fromDate: any = new Date(
          queryData.query
            .substring(queryData.query.indexOf("TIMESTAMP"))
            .split(" ")[1]
        ).getTime();
        let toDate: any = new Date(
          queryData.query
            .substring(queryData.query.lastIndexOf("TIMESTAMP"))
            .split(" ")[1]
        ).getTime();
        const diffInDays = (toDate - fromDate) / (1000 * 3600 * 24);
        if (diffInDays > allowedRange || diffInDays < 0) {
          return {
            errorMessage: constants.invalidDateRange.replace(
              "${allowedRange}",
              allowedRange.toString()
            ),
            isValid: false,
          };
        } else {
          return { isValid: true };
        }
      } else {
        return {
          errorMessage: constants.noDataRange,
          isValid: false,
        };
      }
    } else {
      return { isValid: true };
    }
  }
  private static validateSqlLimits(
    queryData: IString,
    maxLimit: Number = 0
  ): void {
    let isLimit = queryData.query.indexOf("LIMIT");
    if (isLimit == -1) {
      queryData.query = queryData.query.concat(" LIMIT " + maxLimit.toString());
    } else {
      let queryLimit: Number = parseInt(
        queryData.query.substring(isLimit).split(" ")[1]
      );
      let newLimit = queryLimit > maxLimit ? maxLimit : queryLimit || maxLimit;
      queryData.query = queryData.query.replace(
        queryLimit.toString(),
        newLimit.toString()
      );
    }
  }
}

export { ValidationService };
