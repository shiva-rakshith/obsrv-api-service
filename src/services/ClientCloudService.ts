import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../helpers/ResponseHandler';
import httpStatus from 'http-status';
import constants from '../resources/Constants.json';
import { ingestorService } from '../routes/Router';
import { getDateRange, isValidDateRange } from '../utils/common';
import { config as globalConfig } from '../configs/Config';
import CloudService from '../lib/client-cloud-services';
import { exhaustRules } from "../configs/QueryRules";
import moment from "moment";

export class ClientCloudService {
    private cloudProvider: string
    private client: any
    private storage: any
    private config: any
    private momentFormat: string;
    constructor(cloudProvider: string, config?: any) {
        this.cloudProvider = cloudProvider
        this.client = CloudService.init(this.cloudProvider)
        this.config = config
        this.storage = new this.client(this.config)
        this.momentFormat = "YYYY-MM-DD HH:MI:SS";
    }

    verifyDatasetExists = async (datasetId: string) => {
        const datasetRecord = await ingestorService.getDatasetConfig(datasetId);
        return datasetRecord;
    }
    
    getData = async (req: Request, res: Response, next: NextFunction) => {
        const { params } = req;
        const { datasetId } = params;
        const { type } = req.query;
        // Validations
        const datasetRecord = await this.verifyDatasetExists(datasetId);
        if(!datasetRecord) {
            next({statusCode: 404, message: constants.RECORD_NOT_FOUND, errCode: httpStatus["404_NAME"],})
            return;
        }
        const dateRange = getDateRange(req, res);
        const isValidDates = isValidDateRange(
            moment(dateRange.from, this.momentFormat), 
            moment(dateRange.to, this.momentFormat), 
            exhaustRules.common.maxDateRange,
        );
        if(!isValidDates) {
            next({statusCode: 404, message: constants.ERROR_MESSAGE.INVALID_DATE_RANGE.replace("${allowedRange}", exhaustRules.common.maxDateRange.toString()), errCode: httpStatus["404_NAME"],})
            return;
        }

        // Fetch Data
        let resData: any[] = [];
        resData = await this.storage.getFiles(
            globalConfig.label_container, globalConfig.label_container_prefix, type, dateRange, datasetId,
        )
        if(resData.length === 0) {
            next({statusCode: 404, message: constants.EXHAUST.NO_BACKUP_FILES, errCode: httpStatus["400_NAME"],})
        } else {
            ResponseHandler.successResponse(req, res, { status: 200, data: resData, })
        }
    }
}
