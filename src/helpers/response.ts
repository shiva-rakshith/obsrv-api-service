import { AxiosResponse } from "axios";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

type extendedErrorRequestHandler = ErrorRequestHandler & {
  statusCode: number;
  message: string;
  id?: string;
};

class ResponseHandler {
  public static success(req: Request, res: Response, result: AxiosResponse) {
    res
      .status(result.status)
      .json(
        this.refactorResponse({ id: (req as any).id, result: result.data })
      );
  }

  public static refactorResponse({
    id = "druid.api",
    ver = "v1",
    params = { status: "success", errmsg: "No Error" },
    responseCode = "OK",
    result = {},
  }) {
    return {
      id,
      ver,
      ts: Date.now(),
      params,
      responseCode,
      result,
    };
  }

  public static error(error: extendedErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction){
    const { statusCode, message } = error;
  const { id = "druid.api" } = req as any;
  res
    .status(statusCode)
    .json(
      ResponseHandler.refactorResponse({
        id: id,
        params: { status: "failed", errmsg: message },
        responseCode: "failed",
      })
    );
  }
}

export { ResponseHandler };
