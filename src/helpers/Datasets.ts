import _ from 'lodash'
import { ValidationConfig, ExtractionConfig, DedupConfig, DenormConfig, RouterConfig, DatasetConfig } from '../models/ConfigModels'
import { defaultConfig } from '../resources/schemas/DatasetConfigDefault'
import { SchemaMerger } from '../generators/SchemaMerger'
let schemaMerger = new SchemaMerger()
export class Datasets {
    private id: string
    private type: string
    private name: string
    private validation_config: ValidationConfig
    private extraction_config: ExtractionConfig
    private dedup_config: DedupConfig
    private data_schema: object
    private router_config: RouterConfig
    private denorm_config: DenormConfig
    private dataset_config: DatasetConfig
    private status: string
    private version: string
    private created_by: string
    private updated_by: string
    private published_date: Date
    constructor(payload: any) {
        this.id = payload.id
        this.type = payload.type
        this.name = payload.name
        this.validation_config = payload.validation_config
        this.extraction_config = payload.extraction_config
        this.dedup_config = payload.dedup_config
        this.data_schema = payload.data_schema
        this.router_config = payload.router_config
        this.denorm_config = payload.denorm_config
        this.dataset_config = payload.dataset_config
        this.status = payload.status
        this.version = payload.version
        this.created_by = payload.created_by
        this.updated_by = payload.updated_by
        this.published_date = payload.published_date
    }

    public getValues() {
        return Object.assign(this.removeNullValues({ id: this.id, type: this.type, name: this.name, validation_config: this.validation_config, extraction_config: this.extraction_config, dedup_config: this.dedup_config, data_schema: this.data_schema, router_config: this.router_config, denorm_config: this.denorm_config, dataset_config: this.dataset_config, status: this.status, version: this.version, created_by: this.created_by, updated_by: this.updated_by, published_date: this.published_date }), { "updated_date": new Date })
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
        if (this.type == 'master') {
            return defaultConfig.master
        }
        else {
            return defaultConfig.dataset
        }
    }
}