import _ from 'lodash'
import { ValidationConfig, ExtractionConfig, DedupConfig, DenormConfig, RouterConfig } from '../models/ConfigModels'
export class Datasets  {
    private id: string
    private validation_config: ValidationConfig
    private extraction_config: ExtractionConfig
    private dedup_config: DedupConfig
    private data_schema: object
    private router_config: RouterConfig
    private denorm_config: DenormConfig
    private status: string
    private created_by: string
    private updated_by: string

    constructor(payload: any) {
        this.id = payload.id
        this.validation_config = payload.validation_config
        this.extraction_config = payload.extraction_config
        this.dedup_config = payload.dedup_config
        this.data_schema = payload.data_schema
        this.router_config = payload.router_config
        this.denorm_config = payload.denorm_config
        this.status = payload.status
        this.created_by = payload.created_by
        this.updated_by = payload.updated_by
    }

    public getValues() {
        return { id: this.id, validation_config: this.validation_config, extraction_config: this.extraction_config, dedup_config: this.dedup_config, data_schema: this.data_schema, router_config: this.router_config, denorm_config: this.denorm_config, status: this.status, created_by: this.created_by, updated_by: this.updated_by }
    }

    public setValues() {
        return Object.assign(this.removeNullValues(this.getValues()), { "updated_date": new Date })
    }

    public removeNullValues(payload: any) {
        Object.keys(payload).forEach((value) => {
            if (_.isEmpty(payload[value])) delete payload[value]
        })
        return payload
    }
}