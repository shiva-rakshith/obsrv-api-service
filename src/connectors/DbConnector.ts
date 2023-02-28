import knex, { Knex } from "knex";
import { IConnector } from "../models/DatasetModels";
import { DbConnectorConfig } from "../models/ConnectionModels";
import { SchemaMerger } from "../generators/SchemaMerger";
import _ from 'lodash'
const schemaMerger = new SchemaMerger()
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
        const { filters, values } = fields
        const updatedRecordValues = await this.pool.transaction(async (dbTransaction) => {
            const currentRecord = await dbTransaction(table).select(Object.keys(values)).where(filters).first()
            if (_.isUndefined(currentRecord)) { throw new Error('Failed to update record') }
            return schemaMerger.mergeSchema(currentRecord, values)
        })
        await this.pool(table).where(filters).update(updatedRecordValues)
    }

    private readRecord(table: string, fields: any) {
        const query = this.pool.from(table).select().where(fields.filters)
        const { offset, limit } = fields
        if (offset && limit) {
            return query.offset(offset).limit(limit)
        }
        return query
    }


}