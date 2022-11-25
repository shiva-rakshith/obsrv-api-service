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
import moment from "moment";

class ValidationService {
  public static validateNativeQuery(
    query: IQuery,
    commonLimits: ICommonRules,
    dataSourceLimits: IDataSourceRules
  ): IValidationResponse {
    if (dataSourceLimits != undefined && dataSourceLimits) {
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
    const dateRange = query.intervals;
    const allowedRange = queryRules.max_date_range;
    if (dateRange) {
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
    if (dataSourceLimits != undefined && dataSourceLimits) {
      const isDateMentioned = queryData.query.indexOf("TIMESTAMP");
      let limitIndex = queryData.query.indexOf("LIMIT");
      if (limitIndex == -1) {
        queryData.query = queryData.query.concat(
          " LIMIT " + maxRowLimit.toString()
        );
      } else {
        let queryLimit: number = parseInt(
          queryData.query.substring(limitIndex).split(" ")[1]
        );
        let newLimit = this.getNewRowLimit(queryLimit, maxRowLimit);
        queryData.query = queryData.query.replace(
          queryLimit.toString(),
          newLimit.toString()
        );
      }
      const allowedRange = dataSourceLimits.queryRules.scan.max_date_range;
      if (isDateMentioned != -1) {
        let fromDate: any = moment(
          queryData.query
            .substring(queryData.query.indexOf("TIMESTAMP"))
            .split(" ")[1],
          "YYYY-MM-DD HH:MI:SS"
        );
        let toDate: any = moment(
          queryData.query
            .substring(queryData.query.lastIndexOf("TIMESTAMP"))
            .split(" ")[1],
          "YYYY-MM-DD HH:MI:SS"
        );
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

export { ValidationService };
