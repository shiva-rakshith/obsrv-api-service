import _ from 'lodash'
import { ValidationConfig, ExtractionConfig, DedupConfig, DenormConfig, RouterConfig } from '../models/ConfigModels'
import configDefault from '../resources/schemas/DatasetConfigDefault.json'
import { SchemaMerger } from '../generators/SchemaMerger'
let schemaMerger = new SchemaMerger()
export class Datasets {
    private id: string
    private dataset_name: string
    private validation_config: ValidationConfig
    private extraction_config: ExtractionConfig
    private dedup_config: DedupConfig
    private data_schema: object
    private router_config: RouterConfig
    private denorm_config: DenormConfig
    private client_state: object
    private status: string
    private version: string
    private created_by: string
    private updated_by: string
    private published_date: Date

    constructor(payload: any) {
        this.id = payload.id
        this.dataset_name = payload.dataset_name
        this.validation_config = payload.validation_config
        this.extraction_config = payload.extraction_config
        this.dedup_config = payload.dedup_config
        this.data_schema = payload.data_schema
        this.router_config = payload.router_config
        this.denorm_config = payload.denorm_config
        this.client_state = payload.client_state
        this.status = payload.status
        this.version = payload.version
        this.created_by = payload.created_by
        this.updated_by = payload.updated_by
        this.published_date = payload.published_date
    }

    public getValues() {
        return Object.assign(this.removeNullValues({ id: this.id, dataset_name: this.dataset_name, validation_config: this.validation_config, extraction_config: this.extraction_config, dedup_config: this.dedup_config, data_schema: this.data_schema, router_config: this.router_config, denorm_config: this.denorm_config, client_state: this.client_state, status: this.status, version: this.version, created_by: this.created_by, updated_by: this.updated_by, published_date: this.published_date }), { "updated_date": new Date })
    }

    public setValues() {
        return schemaMerger.mergeSchema(this.getDefaults(), this.getValues())
    }

    public removeNullValues(payload: any) {
        Object.keys(payload).forEach((value) => {
            if (_.isEmpty(payload[value])) delete payload[value]
        })
        return payload
    }

    public getDefaults() {
        return configDefault
    }
}