import routes from "../routes/RoutesConfig"
const config = {
  apiStatusEndPoint: "/obsrv/status",
  apiHealthEndPoint: "/obsrv/health",
  apiDruidEndPoint: `${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.NATIVE_QUERY.URL}`,
  apiDruidSqlEndPoint: `${routes.QUERY.BASE_PATH}${routes.QUERY.API_VERSION}${routes.QUERY.SQL_QUERY.URL}`,

  druidHost: "http://localhost",
  druidPort: 8888,
  druidEndPoint: "/druid/v2",
  druidSqlEndPoint: "/druid/v2/sql/",
  druidStatus: "/status",
  druidHealth: "/status/health",
};
export { config };
