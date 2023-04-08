import _ from "lodash";
import { SchemaMerger } from "../generators/SchemaMerger"
import { defaultConfig } from '../resources/schemas/DatasetConfigDefault'
const schemaMerger = new SchemaMerger()
export class DatasetSourceConfigs {
    private id: string
    private dataset_id: string
    private connector_type: string
    private connector_config: object
    private status: string
    private connector_stats: object
    private created_by: string
    private updated_by: string
    constructor(payload: any) {
        this.id = payload.id
        this.dataset_id = payload.dataset_id
        this.connector_type = payload.connector_type
        this.connector_config = payload.connector_config
        this.status = payload.status
        this.connector_stats = payload.connector_stats
        this.created_by = payload.created_by
        this.updated_by = payload.updated_by
    }

    public getValues() {
        return Object.assign(this.removeNullValues({ id: this.id, dataset_id: this.dataset_id, connector_type: this.connector_type, connector_config: this.connector_config, status: this.status, connector_stats: this.connector_stats, created_by: this.created_by, updated_by: this.updated_by, }), { "updated_date": new Date })
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
        return defaultConfig.sourceConfig
    }
}