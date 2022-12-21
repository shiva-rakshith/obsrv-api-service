const config = {
  apiPort: process.env.api_port || 3000,
  druidHost: process.env.druid_host || "http://localhost",
  druidPort: process.env.druid_port || 8888,
  druidStatusEndPoint: process.env.druid_status_end_point || "/status",
  druidHealthEndPoint: process.env.druid_health_end_point || "/status/health",
  druidNativeQueryEndPoint: process.env.druid_native_query_end_point || "/druid/v2",
  druidSqlQueryEndPoint: process.env.druid_sql_query_end_point || "/druid/v2/sql/",
  requestBodySchemaPath: "/src/configs/requestBodySchema.json",
  nativeQuerySchemaPath: "/src/configs/nativeQuerySchema.json",

  limits: {
    common: {
      maxResultThreshold: 100,
      maxResultRowLimit: 100,
    },
    rules: [
      {
        dataSource: "telemetry-events",
        queryRules: {
          groupBy: {
            maxDateRange: 30,
          },
          scan: {
            maxDateRange: 30,
          },
          search: {
            maxDateRange: 30,
          },
          timeBoundary: {
            maxDateRange: 30,
          },
          timeseries: {
            maxDateRange: 30,
          },
          topN: {
            maxDateRange: 30,
          },
        },
      },
      {
        dataSource: "summary-events",
        queryRules: {
          groupBy: {
            maxDateRange: 30,
          },
          scan: {
            maxDateRange: 30,
          },
          search: {
            maxDateRange: 30,
          },
          timeBoundary: {
            maxDateRange: 30,
          },
          timeseries: {
            maxDateRange: 30,
          },
          topN: {
            maxDateRange: 30,
          },
        },
      },
    ],
  },
};

export { config };
