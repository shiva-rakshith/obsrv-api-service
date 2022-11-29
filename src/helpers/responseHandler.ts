import { AxiosResponse } from "axios";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import constants from "../resources/constants.json";

type extendedErrorRequestHandler = ErrorRequestHandler & {
  statusCode: number;
  message: string;
  id?: string;
};

class ResponseHandler {
  public success(req: Request, res: Response, result: AxiosResponse) {
    const responseHandler = new ResponseHandler
    res
      .status(result.status)
      .json(
        responseHandler.refactorResponse({
          id: (req as any).id,
          result: result.data,
        })
      );
  }

  public routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    next({
      statusCode: httpStatus.NOT_FOUND,
      message: constants.ROUTE_NOT_FOUND,
    });
  };

  public refactorResponse({
    id = "druid.api",
    ver = "v1",
    params = { status: "success", errmsg: "No Error" },
    responseCode = "OK",
    result = {},
  }): object {
    return {
      id,
      ver,
      ts: Date.now(),
      params,
      responseCode,
      result,
    };
  }

  public error(
    error: extendedErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const responseHandler=new ResponseHandler
    const { statusCode, message } = error;
    const { id = "druid.api" } = req as any;
    res.status(statusCode).json(
      responseHandler.refactorResponse({
        id: id,
        params: { status: "failed", errmsg: message },
        responseCode: "failed",
      })
    );
  }
  public setApiId =
  (id: string) => (req: Request, res: Response, next: NextFunction) => {
    (req as any).id = id;
    next();
  };
}

export { ResponseHandler };
