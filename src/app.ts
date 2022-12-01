import express, { Application } from "express";
import { config } from "./configs/config";
import { router } from "./routes/router";
const app: Application = express();
import { ResponseHandler } from "./helpers/responseHandler";
const responseHandler = new ResponseHandler();
const globalErrorHandler = responseHandler.error;

app.use(express.json());

app.use("/", router);
app.use("*", responseHandler.routeNotFound);
app.use(globalErrorHandler);

app.listen(config.apiPort, () => {
  console.log(`listening on port ${config.apiPort}`);
});

export default app;
