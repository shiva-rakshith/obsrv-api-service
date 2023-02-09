import _ from "lodash";
import { SchemaSuggestionTemplate } from "../helpers/suggestions";
import { DataSetConfig } from "../models/ConfigModels";
import { Conflict, ConflictTypes, FlattenSchema, Suggestion, SuggestionsTemplate } from "../models/SchemaModels";
import constants from "../resources/constants.json";
import { ConfigService } from "../services/ConfigService";
export class DataSetSuggestionService {
    private schemas: Map<string, any>[];
    constructor(schemas: Map<string, any>[]) {
        this.schemas = schemas;
    }


    public findConflicts(): ConflictTypes[] {
        return this.schemaComparision()
    }

    public suggestConfig(): DataSetConfig {
        const config: DataSetConfig = new ConfigService().suggestConfig()
        return config
    }

    private schemaComparision(): ConflictTypes[] {
        const result: FlattenSchema[] = _.flatten(this.schemas.map(element => {
            const response: FlattenSchema[] = this.flattenSchema(new Map(Object.entries(element)));
            return response
        }))
        var groupedSchema = _.groupBy(result, 'path')
        const conflicts = Object.entries(groupedSchema).map(([key, value]) => {
            return this.getSchemaConflictTypes(this.countKeyValuePairs(value, key))
        })
        return _.filter(conflicts, obj => (!_.isEmpty(obj.schema) || !_.isEmpty(obj.required)))
    }

    public getSchemaConflictTypes(occuranceObj: any): ConflictTypes {
        const absolutePath = _.head(_.keysIn(occuranceObj.absolutePath))
        const updatedPath = absolutePath ? _.replace(absolutePath, "$.", "") : "";
        const schemaConflicts = this.getDataTypeConflict(occuranceObj,)
        const requiredConflicts = this.getRequiredPropConflict(occuranceObj)
        return <ConflictTypes>{ "schema": schemaConflicts, "required": requiredConflicts, "absolutePath": updatedPath }
    }

    private getDataTypeConflict(occurance: any): Conflict {
        if (_.size(occurance.dataType) > 1) {
            const highestValueKey = Object.keys(occurance.dataType).reduce((a, b) => occurance.dataType[a] > occurance.dataType[b] ? a : b)
            return {
                type: constants.SCHEMA_RESOLUTION_TYPE.DATA_TYPE,
                property: Object.keys(occurance.property)[0],
                conflicts: occurance.dataType,
                resolution: { "dataType": highestValueKey },
            }
        } else {
            return <Conflict>{}
        }


    }
    private getRequiredPropConflict(occurance: any): Conflict {
        const requiredCount = _.map(occurance.property, (value, key) => {
            return value
        })[0]

        const highestValueKey = Boolean(Object.keys(occurance.isRequired).reduce((a, b) => occurance.required[a] > occurance.required[b] ? a : b))
        const isPropertyRequired = requiredCount <= 1 ? false : true
        if (highestValueKey != isPropertyRequired) {
            return {
                type: constants.SCHEMA_RESOLUTION_TYPE.REQUIRED_TYPE,
                property: Object.keys(occurance.property)[0],
                conflicts: occurance.property,
                resolution: { "required": (requiredCount <= 1 ? false : true) },
            }
        } else {
            return <Conflict>{}
        }

    }

    public createSuggestionTemplate(sample: any[]): SuggestionsTemplate[] {
        return _.map(sample, (value, key) => {
            const dataTypeSuggestions = this.getRequiredMessageTemplate(value["required"])
            const requiredSuggestions = this.getSchemaMessageTempalte(value["schema"])
            return <SuggestionsTemplate> {
                "property": value.absolutePath,
                "suggestions": _.reject([dataTypeSuggestions, requiredSuggestions], _.isEmpty)
            }
        })
    }

    private getSchemaMessageTempalte(schema: any): Suggestion {
        if (_.isEmpty(schema)) return <Suggestion>{}
        const conflictMessage = SchemaSuggestionTemplate.getSchemaDataTypeMessage(schema["conflicts"], schema["property"])
        return <Suggestion>{
            message: conflictMessage,
            advice: SchemaSuggestionTemplate.TEMPLATES.SCHEMA_SUGGESTION.CREATE.DATATYPE_PROPERTY.ADVICE,
            resolutionType: constants.SCHEMA_RESOLUTION_TYPE.DATA_TYPE,
            priority: constants.PRIORITY.MEDIUM
        }
    }

    private getRequiredMessageTemplate(schema: any): Suggestion {
        if (_.isEmpty(schema)) return <Suggestion>{}
        const conflictMessage = SchemaSuggestionTemplate.getSchemaRequiredTypeMessage(schema["conflicts"], schema["property"])
        return <Suggestion>{
            message: conflictMessage,
            advice: SchemaSuggestionTemplate.TEMPLATES.SCHEMA_SUGGESTION.CREATE.REQUIRED_PROPERTY.ADVICE,
            resolutionType: constants.SCHEMA_RESOLUTION_TYPE.REQUIRED_TYPE,
            priority: constants.PRIORITY.MEDIUM
        }
    }

    public countKeyValuePairs(arrayOfObjects: object[], key: string) {
        return _(arrayOfObjects)
            .flatMap(obj => _.toPairs(obj))
            .groupBy(([key, value]) => key)
            .mapValues(group => _.countBy(group, ([key, value]) => value))
            .value();
    }

    private flattenSchema(sample: Map<string, any>): FlattenSchema[] {
        let array = new Array();
        const recursive = (data: any, path: string, requiredProps: string[], schemaPath: string) => {
            _.forEach(data, (value, key) => {
                if (_.isPlainObject(value) && (_.has(value, 'properties'))) {
                    array.push(this.createFlattenObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`))
                    recursive(value['properties'], `${path}.${key}`, value['required'], `${schemaPath}.properties.${key}`);
                } else {
                    if (_.isPlainObject(value)) {
                        if (value.type === 'array') {
                            array.push(this.createFlattenObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`))
                            if (_.has(value, 'items') && _.has(value["items"], 'properties')) {
                                recursive(value["items"]['properties'], `${path}.${key}[*]`, value["items"]['required'], `${schemaPath}.properties.items.${key}`);
                            } else {
                                array.push(this.createFlattenObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`))
                            }
                        } else {
                            array.push(this.createFlattenObj(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`))
                        }
                    }
                }
            })
        }
        recursive(sample.get("properties"), "$", sample.get("required"), "$")
        return array
    }

    private createFlattenObj(expr: string, objType: string, isRequired: boolean, path: string, schemaPath: string): FlattenSchema {
        return <FlattenSchema>{
            "property": expr,
            "dataType": objType,
            "isRequired": isRequired,
            "path": path,
            "absolutePath": schemaPath
        }
    }

}
