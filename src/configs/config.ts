const config = {
  apiPort: process.env.api_port || 3000,
  druidHost: process.env.druid_host || "http://localhost",
  druidPort: process.env.druid_port || 8082,
  druidEndPoint: process.env.druid_end_point || "/druid/v2",

  limits : {
    common: {
      max_result_threshold: 100,
      max_result_row_limit: 100,
    },
    rules: [
      {
        dataSource: "telemetry-events",
        queryRules: {
          groupBy: {
            max_date_range: 30,
          },
          scan: {
            max_date_range: 30,
          },
          search: {
            max_date_range: 30,
          },
          timeBoundary: {
            max_date_range: 30,
          },
          timeseries: {
            max_date_range: 30,
          },
          topN: {
            max_date_range: 30,
          },
        },
      },
      {
        dataSource: "summary-events",
        queryRules: {
          groupBy: {
            max_date_range: 30,
          },
          scan: {
            max_date_range: 30,
          },
          search: {
            max_date_range: 30,
          },
          timeBoundary: {
            max_date_range: 30,
          },
          timeseries: {
            max_date_range: 30,
          },
          topN: {
            max_date_range: 30,
          },
        },
      },
    ],
  }
};
export { config };
