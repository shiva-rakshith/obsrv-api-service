export interface IValidationResponse {
  errorMessage?: string;
  isValid: boolean;
}

export interface IDataSourceRules {
  dataSource: string;
  queryRules: IQueryTypeRules;
}

export interface ICommonRules {
  max_result_threshold: number;
  max_result_row_limit: number;
}

export interface IQueryTypeRules {
  groupBy: IRules;
  scan: IRules;
  topN: IRules;
  timeseries: IRules;
  timeBoundary: IRules;
  search: IRules;
}

export interface IRules {
  max_date_range?: number;
}

export interface INativeQuery {
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

export interface IQuery {
  context: object;
  query?: INativeQuery;
  querySql?: string;
}
