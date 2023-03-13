import { routesConfig } from "../configs/RoutesConfig"
const config = {
  apiStatusEndPoint: "/obsrv/status",
  apiHealthEndPoint: "/obsrv/health",
  apiDruidEndPoint: `${routesConfig.query.native_query.path}`,
  apiDruidSqlEndPoint: `${routesConfig.query.sql_query.path}`,
  apiDatasetIngestEndPoint: `${routesConfig.data_ingest.path}`,

  druidHost: "http://localhost",
  druidPort: 8888,
  druidEndPoint: "/druid/v2",
  druidSqlEndPoint: "/druid/v2/sql/",
  druidStatus: "/status",
  druidHealth: "/status/health",
};
export { config };
