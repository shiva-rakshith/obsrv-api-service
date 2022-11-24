import httpStatus from 'http-status'
import { ResponseFormatter } from '../helpers/responseFormatter'
import { druidInstance } from '../helpers/axios'
import { Request, Response, NextFunction } from 'express'
import createError from 'http-errors' 
import routes from '../resources/routes.json'

class druidController {

    public static getStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await druidInstance.get(routes.GETSTATUS.URL)
            ResponseFormatter.handler(req, res, result)
        }
        catch (error:any) {
            next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message))
        }
    }
    public static getHealthStatus = async (req: Request, res: Response, next:NextFunction) => {

        try{
            const result = await druidInstance.get(routes.HEALTHCHECK.URL)
            ResponseFormatter.handler(req, res, result)
        }
        catch(error:any)
        {
            next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message))
        }
    }
    public static listDataSources = async (req: Request, res: Response, next:NextFunction) => {
        try {
            const result = await druidInstance.get(routes.LISTDATSOURCES.URL)
            ResponseFormatter.handler(req, res, result)
        }
        catch (error:any) {
            next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message))
        }
    }
    public static executeNativeQuery = async (req: Request, res: Response, next:NextFunction) => {
        try {
            const result = await druidInstance.post(routes.NATIVEQUERY.URL, req.body)
            ResponseFormatter.handler(req, res, result)
        }
        catch (error:any) {
            next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message))

        }
    }
    public static executeSqlQuery = async (req: Request, res: Response, next:NextFunction) => {
        try {
            const result = await druidInstance.post(routes.SQLQUERY.URL, req.body)
            ResponseFormatter.handler(req, res, result)
         }
        catch (error:any) {
            next(createError(httpStatus.INTERNAL_SERVER_ERROR, error.message))
        }
    }
}

export default druidController