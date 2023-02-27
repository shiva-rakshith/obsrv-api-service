import knex, { Knex } from "knex";
import { IConnector } from "../models/DatasetModels";
import { DbConnectorConfig } from "../models/ConnectionModels";

export class DbConnector implements IConnector {
    public pool: Knex
    private config: DbConnectorConfig
    private typeToMethod = {
        insert: this.insertRecord,
        update: this.updateRecord,
        read: this.readRecord
    }
    public method: any
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

    execute(type: keyof typeof this.typeToMethod, property: any) {
        this.method = this.typeToMethod[type]
        return this.method(property["table"], property["fields"])
    }

    private async insertRecord(table: string, fields: any) {
        await this.pool(table).insert(fields)
    }

    private async updateRecord(table: string, fields: any) {
        let rowsUpdated = await this.pool(table).where(fields.filters).update(fields.values)
        if (rowsUpdated == 0) { throw new Error("Failed to update Record") }
    }

    private async readRecord(table: string, fields: any) {
        const query = this.pool.from(table).select().where(fields.filters)
        const { offset, limit } = fields
        if (offset && limit) {
            return query.offset(offset).limit(limit)
        }

        return query
    }


}