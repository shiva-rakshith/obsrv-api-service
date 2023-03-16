import knex, { Knex } from "knex";
import { IConnector } from "../models/DatasetModels";
import { DbConnectorConfig } from "../models/ConnectionModels";
import { SchemaMerger } from "../generators/SchemaMerger";
import constants from '../resources/Constants.json'
import _ from 'lodash'
const schemaMerger = new SchemaMerger()
export class DbConnector implements IConnector {
    public pool: Knex
    private config: DbConnectorConfig
    public typeToMethod = {
        insert: this.insertRecord,
        update: this.updateRecord,
        read: this.readRecord
    }
    public method: any
    constructor(config: DbConnectorConfig) {
        this.config = config;
        this.pool = knex(this.config)
    }
    public init = () => {
        this.connect()
            .then(() => console.info("Database Connection Established..."))
            .catch((err: Error) => console.error(`Database Connection failed: ${err.message}`))
    }

    async connect() {
        return await this.pool.raw("SELECT 1+1;")
    }

    async close() {
        return await this.pool.destroy()
    }

    execute(type: keyof typeof this.typeToMethod, property: any) {
        this.method = this.typeToMethod[type]
        return this.method(property["table"], property["fields"])
    }

    public async insertRecord(table: string, fields: any) {
        let fetchedRecords = await this.pool(table).select().where('id', '=', fields.id)
        return fetchedRecords.length > 0 ? (() => { throw constants.DUPLICATE_RECORD })() : await this.pool(table).insert(fields)
    }

    public async updateRecord(table: string, fields: any) {
        const { filters, values } = fields
        await this.pool.transaction(async (dbTransaction) => {
            const currentRecord = await dbTransaction(table).select(Object.keys(values)).where(filters).first()
            if (_.isUndefined(currentRecord)) { throw constants.FAILED_RECORD_UPDATE }
            await dbTransaction(table).where(filters).update(schemaMerger.mergeSchema(currentRecord, values)
            )
        })
    }

    public async readRecord(table: string, fields: any) {
        const query = this.pool.from(table).select().where((builder) => {
            const filters = fields.filters || {};
            if (filters.status) {
                if (Array.isArray(filters.status) && filters.status.length > 0) {
                    builder.whereIn("status", filters.status);
                } else if (filters.status.length > 0) {
                    builder.where("status", filters.status);
                }
            }
            delete filters.status;
            builder.where(filters);
        });
        const { offset, limit } = fields
        if (offset && limit) {
            return query.offset(offset).limit(limit)
        }
        return await query
    }
}