import knex, { Knex } from "knex";
import { IConnector } from "../models/DatasetModels";
import { DbConnectorConfig } from "../models/ConnectionModels";

export class DbConnector implements IConnector {
    private config: DbConnectorConfig
    private pool: Knex
    constructor(config: DbConnectorConfig) {
        this.config = config;
        this.pool = knex(this.config)
    }

    async connect() {
        throw new Error("Method not implemented.");

    }

    async close() {
        throw new Error("Method not implemented.");

    }

    async execute(type: string, query: any) {
        switch (type) {
            case 'INSERT':
                return this.insertRecord(query["table"], query["values"])
            case "UPDATE":
                return this.updateRecord(query["table"], query["filters"], query["values"])
            case 'READ':
                return this.readRecord(query["table"], query["filters"])
            default:
                throw new Error("invalid Query type")
        }
    }

    private async insertRecord(tableName: string, values: any) {
        await this.pool(tableName).insert(values)
    }

    private async updateRecord(tableName: string, filterColumns: object, values: any) {
        await this.pool(tableName).where(filterColumns).update(values)
    }

    private async readRecord(tableName: string, filterColumns: object) {
        return await this.pool.from(tableName).select().where(filterColumns)
    }
}