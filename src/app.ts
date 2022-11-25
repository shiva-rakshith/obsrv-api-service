import express, { Application } from "express";
import { config } from "./config/config";
import { router } from "./routes/router";
const app: Application = express();
import { ResponseHandler } from "./helpers/response";
import { routeNotFound } from "./helpers/noRouteFound";
const globalErrorHandler = ResponseHandler.error;
app.use(express.json());

app.use("/", router);
app.use("*", routeNotFound);
app.use(globalErrorHandler);

app.listen(config.apiPort, () => {
  console.log(`listening on port ${config.apiPort}`);
});

export default app;
