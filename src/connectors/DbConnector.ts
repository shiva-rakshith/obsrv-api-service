import knex, { Knex } from "knex";
import { IConnector } from "../models/DatasetModels";
import { DbConnectorConfig } from "../models/ConnectionModels";
import { SchemaMerger } from "../generators/SchemaMerger";
import constants from '../resources/Constants.json'
import { config as appConfig } from "../configs/Config"
import { HTTPConnector } from "./HttpConnector";
import _ from 'lodash'
const schemaMerger = new SchemaMerger()
let httpInstance = new HTTPConnector(`${appConfig.query_api.druid.host}:${appConfig.query_api.druid.port}`)
let httpConnector = httpInstance.connect()
export class DbConnector implements IConnector {
    public pool: Knex
    private config: DbConnectorConfig
    public typeToMethod = {
        insert: this.insertRecord,
        update: this.updateRecord,
        read: this.readRecords,
        upsert: this.upsertRecord,
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
        await this.pool.select(1)
    }

    async close() {
        return await this.pool.destroy()
    }

    execute(type: keyof typeof this.typeToMethod, property: any) {
        let isDatasource = property[ "table" ] === appConfig.table_names.datasources
        this.method = this.typeToMethod[ type ]
        return this.method(property[ "table" ], property[ "fields" ], isDatasource)
    }

    public async insertRecord(table: string, fields: any, isDatasource: boolean) {
        await this.pool.transaction(async (dbTransaction) => {
            if (isDatasource) {
                await this.submitIngestion(_.get(fields, ['ingestion_spec']))
                    .catch((error: any) => {
                        throw constants.INGESTION_FAILED_ON_CREATE
                    })
            }
            await dbTransaction(table).insert(fields)
        })

    }

    public async updateRecord(table: string, fields: any, isDatasource: boolean) {
        const { filters, values } = fields
        await this.pool.transaction(async (dbTransaction) => {
            const currentRecord = await dbTransaction(table).select(Object.keys(values)).where(filters).first()
            if (_.isUndefined(currentRecord)) { throw constants.FAILED_RECORD_UPDATE }
            if (!_.isUndefined(currentRecord.tags)) { delete currentRecord.tags }
            if (isDatasource) {
                await this.submitIngestion(_.get(fields, ['values', 'ingestion_spec']))
                    .catch((error: any) => {
                        throw constants.INGESTION_FAILED_ON_UPDATE
                    })
            }
            await dbTransaction(table).where(filters).update(schemaMerger.mergeSchema(currentRecord, values))
        })
    }

    public async upsertRecord(table: string, fields: any, isDatasource: boolean) {
        const { filters, values } = fields;
        const existingRecord = await this.pool(table).select().where(filters).first()
        if (!_.isUndefined(existingRecord)) {
            await this.pool.transaction(async (dbTransaction) => {
                if (isDatasource) {
                    await this.submitIngestion(_.get(fields, ['values', 'ingestion_spec']))
                        .catch((error: any) => {
                            throw constants.INGESTION_FAILED_ON_UPDATE
                        })
                }
                await dbTransaction(table).where(filters).update(schemaMerger.mergeSchema(existingRecord, values))
            })
        } else {
            await this.pool(table).insert(values)
        }
    }

    public async readRecords(table: string, fields: any) {
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
        })
        return await query
    }

    public async listRecords(table: string) {
        return await this.pool.select('*').from(table)
    }

    public async submitIngestion(ingestionSpec: any){
        return await httpConnector.post(`${appConfig.query_api.druid.submit_ingestion}`, ingestionSpec )
    }
}