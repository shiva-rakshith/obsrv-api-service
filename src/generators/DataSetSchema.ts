import _, { values } from "lodash";
import { ISchemaGenerator } from "../models/IngestionModels";
import { suggestions } from "../helpers/suggestions";

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
        const suggestions = this.schemaComparision(generatedSchema)
        const updatedSchema = _.reduce(generatedSchema, _.extend)
        return {"schema": updatedSchema, "suggestions": suggestions}
    }
    schemaComparision(schema: Map<string, any>[]): any {
        const result = schema.map(element => {
            const sample = new Map(Object.entries(element));
            const response = this.generateExpression(sample);
            return response
        })
        // group by property (ex: edata.type or eid)
        var groupedSchema = _.groupBy(_.flatten(result), 'path')
        const data: Map<string, any>[] = _.flatten(_.reject(Object.entries(groupedSchema).map(([key, value]) => {
            const array = new Array()
            const props = ["objectType", "isRequired"]
            const occurance = props.map((prop) => {
                return _.filter(this.getOccurance(value, prop, key), ["suggestionRequired", true])
            })
            const filteredData = _.flatMapDeep(occurance)
            if (!_.isEmpty(filteredData)) array.push({ "schema": filteredData, "property": key })
            return array

        }), _.isEmpty));
        const suggestions = this.invokeSuggestion(data)
        return suggestions
    }

    invokeSuggestion(sample: any[]) {
        return _.flattenDeep(sample.map(data => {
            return this.getSchemaSuggestions(data["schema"], data["property"])
        }))
    }
    getSchemaSuggestions(data: any[], property: string) {
        return data.map((res: any) => {
            const conflictMessage = `The Conflict at "${res["conflictProperty"]}" Property. Found(${this.getSubMessage(res["conflicts"])})`
            return {
                "property": property,
                "suggestions": [{
                    message: conflictMessage,
                    advice: suggestions.DATATYPE_TEMPLATE.schema.create.advice.dataType,
                    severity: "LOW",
                    resolutionType: "DATA_TYPE"
                }]
            }
        })
    }

    getSubMessage(conflicts: any[]) {
        return conflicts.map(con => {
            return `${con["objectType"]}:${con["occurance"]}`
        }).join(',')
    }


    getOccurance(sample: any[], prop: string, key: string): any {
        let propMap = new Map();
        const properties = _(sample).countBy(prop)
            .map(function (count, ip) {
                let map = new Map();
                map.set("occurance", count)
                map.set(prop, ip)
                return Object.fromEntries(map)

            }).sortBy('-occurance')
            .value()
        const resolution = _.castArray(_.maxBy(properties, 'occurance'))
        const occurance = {
            "conflicts": properties,
            "resolution": resolution,
            "conflictProperty": prop,
            "suggestionRequired": properties.length != resolution.length
        }
        propMap.set(prop, occurance)
        return Object.fromEntries(propMap)
    }

    generateExpression(sample: Map<string, any>): any[] {
        let array = new Array();
        const recursive = (data: any, path: string, requiredProps: string[]) => {
            _.forEach(data, (value, key) => {
                if (_.isPlainObject(value) && (_.has(value, 'properties'))) {
                    array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`,))
                    recursive(value['properties'], `${path}.${key}`, value['required']);
                } else {
                    if (_.isPlainObject(value)) {
                        if (value.type === 'array') {
                            if (_.has(value, 'items') && _.has(value["items"], 'properties')) {
                                recursive(value["items"]['properties'], `${path}.${key}[*]`, value['required']);
                            } else {
                                array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`,))
                            }
                        } else {
                            array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`,))
                        }
                    }
                }

            })
        }
        recursive(sample.get("properties"), "$", sample.get("required"))
        return array
    }

    createSpecObj(expr: string, objType: string, isRequired: boolean, path: string): any {
        return {
            "property": expr,
            "objectType": objType,
            "isRequired": isRequired,
            "path": path
        }
    }

    process(sample: Map<string, any>) {
        throw new Error("Method not implemented.");
    }

}