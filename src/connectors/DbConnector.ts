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
        let fetchedRecords = await this.pool(table).select().where('id', '=', fields.id)
        return fetchedRecords.length > 0 ? (() => { throw new Error('Record already exists') })() : await this.pool(table).insert(fields)
    }

    private async updateRecord(table: string, fields: any) {
        const { filters, values } = fields
        await this.pool.transaction(async (dbTransaction) => {
            const currentRecord = await dbTransaction(table).select(Object.keys(values)).where(filters).first()
            if (_.isUndefined(currentRecord)) { throw new Error('Failed to update record') }
            await dbTransaction(table).where(filters).update(schemaMerger.mergeSchema(currentRecord, values)
            )
        })
    }

    private async readRecord(table: string, fields: any) {
        // const query = this.pool.from(table).select().where(fields.filters)
        const query = this.pool.from(table).select().where((builder) => {
            const filters = fields.filters || {};
            if (filters.id) {
                builder.where("id", "=", filters.id);
            }
            const status = filters.status ? filters.status : [];
            if (status.length > 0) {
                builder.whereIn("status", status);
            }
        });
        const { offset, limit } = fields
        if (offset && limit) {
            return query.offset(offset).limit(limit)
        }
        const fetchedRecords = await query
        return fetchedRecords.length > 0 ? fetchedRecords : (() => { throw new Error('No records found') })()
    }

}