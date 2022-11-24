export interface IValidationResponse {
  errorMessage?: string;
  isValid: boolean;
}

export interface IDataSourceLimits {
  limits: ILimits[];
}
export interface ILimits {
  common: ICommon;
  dataSource: string;
  queryRules: IQueryRules;
}

export interface ICommon {
  max_result_threshold: number;
  max_result_row_limit: number;
}

export interface IQueryRules {
  groupBy: IRules;
  scan: IRules;
  topN: IRules;
  timeseries: IRules;
  timeBoundary: IRules;
  search: IRules;
}

export interface IRules {
  max_date_range?: Number;
}

export interface IDimension {
  [name: string]: any;
}

export interface IQuery {
  queryType: string;
  dataSource: string;
  dimension?: string;
  dimensions?: string[];
  filter?: IFilter;
  aggregations?: any[];
  postAggregations?: any[];
  limit?: number;
  threshold?: number;
  intervals?: string[] | string;
}

export interface IFilter {
  type?: string;
  fields?: IFilter[];
  field?: IFilter;
  dimension?: string;
  dimensions?: string[];
}
export interface IString {
  query: string;
}
