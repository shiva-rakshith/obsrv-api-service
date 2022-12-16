const config = {
  apiPort: process.env.api_port || 3000,
  druidHost: process.env.druid_host || "http://localhost",
  druidPort: process.env.druid_port || 8888,
  druidEndPoint: process.env.druid_end_point || "/druid/v2",
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
