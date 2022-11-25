import { Request, Response, NextFunction } from "express"
import httpStatus from "http-status"
import constants from "../resources/constants.json";

const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    next({ statusCode: httpStatus.NOT_FOUND, message: constants.ROUTE_NOT_FOUND })
}

export { routeNotFound }