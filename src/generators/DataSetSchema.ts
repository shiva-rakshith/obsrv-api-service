import _, { values } from "lodash";
import { ISchemaGenerator } from "../models/IngestionModels";

import { inferSchema } from "@jsonhero/schema-infer";
export class DataSetSchema implements ISchemaGenerator {
    private dataset: string;

    constructor(dataset: string, config: Map<string, any>) {
        this.dataset = dataset
    }

    generate(sample: Map<string, any>[]): any {
        const generatedSchema: any[] = _.map(sample, (value, key): any => {
            return inferSchema(value).toJSONSchema()
        })
        this.schemaComparision(generatedSchema)
        return _.reduce(generatedSchema, _.extend)
    }

    schemaComparision(schema: Map<string, any>[]): any {
        const map = new Map<string, any>
        schema.map(element => {
            const sample = new Map(Object.entries(element));
            const prope = this.generateExpression(sample);
            console.log("prope " + JSON.stringify(Object.fromEntries(prope)))
        });
    }

    generateExpression(sample: Map<string, any>): Map<string, any> {
        let array = new Array();
        const recursive = (data: any, path: string, requiredProps: string[]) => {
            _.forEach(data, (value, key) => {
                if (_.isPlainObject(value) && (_.has(value, 'properties'))) {
                    array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}_${key}`,))
                    recursive(value['properties'], `${path}.${key}`, value['required']);
                } else {
                    if (_.isPlainObject(value)) {
                        if (value.type === 'array') {
                            if (_.has(value, 'items') && _.has(value["items"], 'properties')) {
                                recursive(value["items"]['properties'], `${path}.${key}[*]`, value['required']);
                            } else {
                                array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}_${key}`,))
                            }
                        } else {
                            array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}_${key}`,))
                        }
                    }
                }

            })
        }
        recursive(sample.get("properties"), "$", sample.get("required"))
        return map
    }

    createSpecObj(expr: string, objType: string, isRequired: boolean, path: string): any {
        return {
            "property": expr,
            "type": objType,
            "isRequired": isRequired,
            "path": path
        }
    }

    process(sample: Map<string, any>) {
        throw new Error("Method not implemented.");
    }

    createSchemaSpec(property: string, objType: string, isRequired: boolean): any {
        return {
            "property": property,
            "type": objType,
            "isRequired": isRequired
        }
    }

}