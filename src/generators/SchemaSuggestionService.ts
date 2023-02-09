import { response } from "express";
import _ from "lodash";
import { suggestions } from "../helpers/suggestions";
import { ConflictSchema, DataSetConfig, ObjectType, Suggestions } from "../models/DatasetModels";
import { ConfigService } from "../services/ConfigService";
export class DataSetSuggestionService {
    private schemas: Map<string, any>[];
    constructor(schemas: Map<string, any>[]) {
        this.schemas = schemas;
    }

    public suggestSchema(): Suggestions[] {
        return this.schemaComparision()
    }

    public suggestConfig(): any {
        const config: DataSetConfig = new ConfigService().suggestConfig()
        return config
    }

    private schemaComparision(): Suggestions[] {
        const result = this.schemas.map(element => {
            const sample = new Map(Object.entries(element));
            const response = this.flattenSchema(sample);
            return response
        })
        var groupedSchema = _.groupBy(_.flatten(result), 'path')
        const conflicts = Object.entries(groupedSchema).map(([key, value]) => {
            return this.getSchemaConflictTypes(this.countKeyValuePairs(value, key))
        })
        return _.filter(conflicts, obj => (!_.isEmpty(obj.schema) || !_.isEmpty(obj.required)))

        //console.log("occurance" + JSON.stringify(_.filter(conflicts, obj => (!_.isEmpty(obj.schema) || !_.isEmpty(obj.required)) )))




        //console.log("occ" + JSON.stringify(Object.fromEntries(occuranceValue[0])))
        //console.log("response" + JSON.stringify(Object.fromEntries(res[0])))
        // groupedSchema.map((value:any, key:any) => {
        //         console.log("value" + JSON.stringify(value))
        //         console.log("key" + JSON.stringify(value))
        // })


        // const data: Map<string, any>[] = _.flatten(_.reject(Object.entries(groupedSchema).map(([key, value]) => {
        //     const array = new Array()
        //     const props = ["objectType", "isRequired", "fullPath"]
        //     console.log("value .." + JSON.stringify(value))

        //     // const occurance = props.map((prop) => {
        //     //     return _.filter(this.getOccurance(value, prop, key), ["suggestionRequired", true])
        //     // })

        //     console.log("occurance" + JSON.stringify(occurance))
        //     const filteredData = _.flatMapDeep(occurance)
        //     if (!_.isEmpty(filteredData)) array.push({ "schema": filteredData, "property": key })
        //     return array
        // }), _.isEmpty));
        // return data
        // console.log("data" + JSON.stringify(data))
        // const suggestions = this.invokeSuggestion(data)
        // return suggestions
    }

    public getSchemaConflictTypes(occuranceObj: any):Suggestions {
        console.log("occuranceObj" + JSON.stringify(occuranceObj))
        const propertyFullPath = _.head(_.keysIn(occuranceObj.fullPath))
        const updatedPath = propertyFullPath ? _.replace(propertyFullPath, "$.", ""): "";
        
        const schemaConflicts = this.getDataTypeConflict(occuranceObj, )
        const requiredConflicts = this.getRequiredPropConflict(occuranceObj)

        return { "schema": schemaConflicts, "required": requiredConflicts, "fullPath":  updatedPath}
    }

    private getDataTypeConflict(occurance: any): ConflictSchema {
        if (_.size(occurance.dataType) > 1) {
            const highestValueKey = Object.keys(occurance.dataType).reduce((a, b) => occurance.dataType[a] > occurance.dataType[b] ? a : b)
            return {
                type: "DATA_TYPE",
                property: Object.keys(occurance.property)[0],
                conflicts: occurance.dataType,
                resolution: { "dataType": highestValueKey },
            }
        } else {
            return <ConflictSchema>{}
        }


    }
    private getRequiredPropConflict(occurance: any): ConflictSchema {
        const requiredCount = _.map(occurance.property, (value, key) => {
            return value
        })[0]

        const highestValueKey = Boolean(Object.keys(occurance.isRequired).reduce((a, b) => occurance.required[a] > occurance.required[b] ? a : b))
        console.log("highestValueKey" + highestValueKey)

        const isPropertyRequired = requiredCount <= 1 ? false : true
        if (highestValueKey != isPropertyRequired) {
            return {
                type: "REQUIRED_TYPE",
                property: Object.keys(occurance.property)[0],
                conflicts: occurance.property,
                resolution: { "required": (requiredCount <= 1 ? false : true) },
            }
        } else {
            return <ConflictSchema>{}
        }

    }



    //public createSuggestionTemplate()
    public createSuggestionTemplate(sample: any[]): any[] {
        return _.flattenDeep(sample.map(data => {
            return this.getSchemaSuggestions(data["schema"], data["property"])
        }))
    }


    private getSchemaSuggestions(data: any[], property: string): any[] {
        return data.map((res: any) => {
            const conflictMessage = `The Conflict at "${res["conflictProperty"]}" Property. Found(${this.getSubMessage(res["conflicts"])})`
            return {
                property: property,
                suggestions: [{
                    message: conflictMessage,
                    advice: suggestions.DATATYPE_TEMPLATE.schema.create.advice.dataType,
                    severity: "LOW",
                    resolutionType: "DATA_TYPE"
                }]
            }
        })
    }

    private getSubMessage(conflicts: any[]): string {
        return conflicts.map(con => {
            return `${con["objectType"]}:${con["occurance"]}`
        }).join(',')
    }

    public countKeyValuePairs(arrayOfObjects: object[], key: string) {
        const map = new Map()
        const res = _(arrayOfObjects)
            .flatMap(obj => _.toPairs(obj))
            .groupBy(([key, value]) => key)
            .mapValues(group => _.countBy(group, ([key, value]) => value))
            .value();
        return res
        //console.log("res" + JSON.stringify(res))    
        //map.set(key, res)
        //return map
    }


    private getOccurance(sample: any[], prop: string, key: string): any {
        let propMap = new Map();
        const properties = _(sample).countBy(prop)
            .map(function (count, ip) {
                let map = new Map();
                map.set("occurance", count)
                map.set(prop, ip)
                map.set("fullPath", sample[0]["fullPath"])
                return Object.fromEntries(map)

            }).sortBy('-occurance')
            .value()
        //console.log("properties" + JSON.stringify(properties))    
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

    private flattenSchema(sample: Map<string, any>): any[] {
        let array = new Array();
        const recursive = (data: any, path: string, requiredProps: string[], schemaPath: string) => {
            _.forEach(data, (value, key) => {
                if (_.isPlainObject(value) && (_.has(value, 'properties'))) {
                    array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`))
                    recursive(value['properties'], `${path}.${key}`, value['required'], `${schemaPath}.properties.${key}`);
                } else {
                    if (_.isPlainObject(value)) {
                        if (value.type === 'array') {
                            array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`))
                            if (_.has(value, 'items') && _.has(value["items"], 'properties')) {
                                recursive(value["items"]['properties'], `${path}.${key}[*]`, value["items"]['required'], `${schemaPath}.properties.items.${key}`);
                            } else {
                                array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`))
                            }
                        } else {
                            array.push(this.createSpecObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`))
                        }
                    }
                }
            })
        }
        recursive(sample.get("properties"), "$", sample.get("required"), "$")
        return array
    }

    private createSpecObj(expr: string, objType: string, isRequired: boolean, path: string, schemaPath: string): any {
        return {
            "property": expr,
            "dataType": objType,
            "isRequired": isRequired,
            "path": path,
            "fullPath": schemaPath

        }
    }

}
