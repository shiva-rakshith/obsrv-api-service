import _ from "lodash";
import { SchemaMerger } from "../generators/SchemaMerger"
import { defaultConfig } from '../resources/schemas/DatasetConfigDefault'
const schemaMerger = new SchemaMerger()
export class DatasetTransformations {
    private id: string
    private dataset_id: string
    private field_key: string
    private transformation_function: object
    private status: string
    private created_by: string
    private updated_by: string
    private published_date: string
    constructor(payload: any) {
        if (payload.id) {
            this.id = payload.id
        }
        else {
            this.id = payload.dataset_id + '_' + payload.field_key
        }
        this.dataset_id = payload.dataset_id
        this.field_key = payload.field_key
        this.transformation_function = payload.transformation_function
        this.status = payload.status
        this.created_by = payload.created_by
        this.updated_by = payload.updated_by
        this.published_date = payload.published_date
    }

    public getValues() {
        return Object.assign(this.removeNullValues({ id: this.id, dataset_id: this.dataset_id, field_key: this.field_key, transformation_function: this.transformation_function, status: this.status, created_by: this.created_by, updated_by: this.updated_by, published_date: this.published_date }), { "updated_date": new Date })
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
        return defaultConfig.transformations
    }
}