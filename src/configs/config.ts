const config = {
  apiPort: process.env.api_port || 3000,
  druidHost: process.env.druid_host || "http://localhost",
  druidPort: process.env.druid_port || 8888,
  druidStatusEndPoint: process.env.druid_status_end_point || "/status",
  druidHealthEndPoint: process.env.druid_health_end_point || "/status/health",
  druidNativeQueryEndPoint: process.env.druid_native_query_end_point || "/druid/v2",
  druidSqlQueryEndPoint: process.env.druid_sql_query_end_point || "/druid/v2/sql/",
};

export { config };
