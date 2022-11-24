import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { ResponseFormatter } from '../helpers/responseFormatter'

type extendedErrorRequestHandler = ErrorRequestHandler & { statusCode: number, message: string, id?: string }

export default (error: extendedErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
    const { statusCode, message } = error
    const { id = "druid.api" } = req as any
    res.status(statusCode).json(ResponseFormatter.refactorResponse({ "id": id, "params": { "status": "failed", "errmsg": message }, "responseCode": "failed" }))
}