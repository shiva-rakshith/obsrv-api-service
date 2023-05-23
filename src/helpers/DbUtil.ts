import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../helpers/ResponseHandler";
import constants from "../resources/Constants.json";
import { config } from "../configs/Config";
import _ from "lodash";
import { IConnector } from "../models/DatasetModels";
import { refreshDatasetConfigs } from "./DatasetConfigs";

export class DbUtil {
    private dbConnector: IConnector
    private table: string
    constructor(dbConnector: IConnector, table: string) {
        this.dbConnector = dbConnector
        this.table = table
    }
    public save = async (req: Request, res: Response, next: NextFunction, fields: any) => {
        const filters = this.getFilters(this.table, fields)
        const fetchedRecord = await this.dbConnector.execute("read", { table: this.table, fields: { "filters": filters } })
        if (!_.isEmpty(fetchedRecord)) { throw constants.DUPLICATE_RECORD }
        console.log(`Saving record in table ${this.table} with entry ${JSON.stringify(filters)}`)
        await this.dbConnector.execute("insert", { "table": this.table, "fields": fields })
             .then(() => {
                console.log(constants.RECORD_SAVED)
                ResponseHandler.successResponse(req, res, { status: 200, data: Object.assign({ message: constants.RECORD_SAVED }, filters) });
            })
    }
    public update = async (req: Request, res: Response, next: NextFunction, fields: any) => {
        const filters = this.getFilters(this.table, fields)
        console.log(`Updating record in table ${this.table} with entry ${JSON.stringify(filters)}`)
        await this.dbConnector.execute("update", { "table": this.table, "fields": { "filters": filters, "values": fields } })
             .then(() => {
                console.log(constants.RECORD_UPDATED)
                ResponseHandler.successResponse(req, res, { status: 200, data: Object.assign({ message: constants.RECORD_UPDATED }, filters) });
            })
    }
    public upsert = async (req: Request, res: Response, next: NextFunction, fields: any) => {
        const filters = this.getFilters(this.table, fields)
        console.log(`Updating record in table ${this.table} with entry ${JSON.stringify(filters)}`)
        await this.dbConnector.execute("upsert", { "table": this.table, "fields": { "filters": filters, "values": fields } })
            .then(() => {
                console.log(constants.RECORD_UPDATED)
                ResponseHandler.successResponse(req, res, { status: 200, data: Object.assign({ message: constants.RECORD_UPDATED }, filters) });
            })
    }
    public read = async (req: Request, res: Response, next: NextFunction, fields: any) => {
        const filters = this.getFilters(this.table, fields)
        console.log(`Fetching record from ${this.table} with entry ${JSON.stringify(filters)}`)
        await this.dbConnector.execute("read", { "table": this.table, "fields": { "filters": filters } })
            .then((data: any[]) => {
                !_.isEmpty(data) ? ResponseHandler.successResponse(req, res, { status: 200, data: _.first(data) }) : (() => { throw constants.RECORD_NOT_FOUND; })()
            })
    }
    public list = async (req: Request, res: Response, next: NextFunction, fields: any) => {
        console.log(`Fetching records from ${this.table} with entry ${JSON.stringify(fields.filters)}`)
        await this.dbConnector.execute("read", { "table": this.table, "fields": fields })
            .then((data: any) => {
                ResponseHandler.successResponse(req, res, { status: 200, data: data });
            })
    }
    private getFilters = (table: string, fields: any) => {
        let filters: any = {}
        const table_config: any = config["table_config"][table as keyof typeof config.table_config]
        filters[table_config["pk"]] = fields[table_config["pk"]]
        return filters
    }
}
