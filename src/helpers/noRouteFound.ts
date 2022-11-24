import { Request, Response, NextFunction } from "express"
import httpStatus from "http-status"

const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    next({statusCode: httpStatus.NOT_FOUND, message: "Route not found" })
}

export { routeNotFound }