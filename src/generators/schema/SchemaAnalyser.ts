import _ from "lodash";
import { Conflict, ConflictTypes, FlattenSchema, Occurance } from "../../models/SchemaModels";
import constants from "../../resources/Constants.json";

export class SchemaAnalyser {
    private transformationCols = ["email", "creditcard", "ipv4", "ipv6"]
    private dateFormatCols = ["date", "date-time"]
    private cardinalCols = ["uuid"]

    private schemas: Map<string, any>[];
    private minimumSchemas: number = 1


    constructor(schemas: Map<string, any>[]) {
        this.schemas = schemas;
    }

    public analyseSchema(): ConflictTypes[] {
        return this.findConflicts()
    }

    private findConflicts(): ConflictTypes[] {
        const result: FlattenSchema[] = _.flatten(this.schemas.map(element => {
            return this.flattenSchema(new Map(Object.entries(element)));
        }))
        const conflicts = Object.entries(_.groupBy(result, 'path')).map(([key, value]) => {
            return this.getSchemaConflictTypes(this.countKeyValuePairs(value, key))
        })
        return _.filter(conflicts, obj => (!_.isEmpty(obj.schema) || !_.isEmpty(obj.required) || !_.isEmpty(obj.formats)))
    }

    private getSchemaConflictTypes(occuranceObj: Occurance): ConflictTypes {
        const absolutePath = _.head(_.keysIn(occuranceObj.absolutePath))
        const updatedPath = absolutePath ? _.replace(absolutePath, "$.", "") : "";
        const schemaConflicts = this.getDataTypeConflict(occuranceObj,)
        const requiredConflicts = (_.size(this.schemas) > this.minimumSchemas) ? this.getRequiredPropConflict(occuranceObj) : {}
        const formatConflict = this.getPropertyFormateConflicts(occuranceObj)
        return <ConflictTypes>{ "schema": schemaConflicts, "required": requiredConflicts, "formats": formatConflict, "absolutePath": updatedPath }
    }

    private getDataTypeConflict(occurance: Occurance): Conflict {
        const minimumOccurance: number = 1
        if (_.size(occurance.dataType) > minimumOccurance) {
            const isUnresolvable: boolean = _.uniq(_.values(occurance.dataType)).length === 1;
            const highestValueKey = !isUnresolvable ? Object.keys(occurance.dataType).reduce((a, b) => occurance.dataType[a] > occurance.dataType[b] ? a : b) : undefined
            return {
                type: constants.SCHEMA_RESOLUTION_TYPE.DATA_TYPE,
                property: Object.keys(occurance.property)[0],
                conflicts: occurance.dataType,
                resolution: { "value": highestValueKey, "type": "DATA_TYPE" },
                values: _.keys(occurance.dataType),
                severity: isUnresolvable ? "CRITICAL" : "HIGH"
            }
        } else { return <Conflict>{} }
    }


    private getPropertyFormateConflicts(occurance: Occurance): Conflict {
        const filteredFormat = _.omit(occurance.format, "undefined")
        const formats = _.concat(this.transformationCols, this.dateFormatCols, this.cardinalCols, ["uri"]);
        if (!_.isEmpty(filteredFormat)) {
            const formatName = _.filter(formats, f => _.has(filteredFormat, f));
            const suggestedFormat = this.suggestFormat(formatName[0])
            return {
                type: formatName[0],
                property: (Object.keys(occurance.path)[0]).replace("$.", ""),
                conflicts: filteredFormat,
                resolution: { "value": formatName, "type": suggestedFormat.type },
                values: _.keys(filteredFormat),
                severity: suggestedFormat.severity || ""
            }
        } else { return <Conflict>{} }

    }

    private suggestFormat(value: string) {
        if (_.includes(this.transformationCols, value)) {
            return { type: "TRANSFORMATION", "severity": "LOW" };
        } else if (_.includes(this.dateFormatCols, value)) {
            return { type: "INDEX", "severity": "LOW" };
        } else if (_.includes(this.cardinalCols, value)) {
            return { type: "DEDUP", "severity": "LOW" };
        } else {
            return {};
        }
    }

    private getRequiredPropConflict(occurance: Occurance): Conflict {
        const maxOccurance: number = 1
        const requiredCount = _.map(occurance.property, (value, key) => {
            return value
        })[0]

        const highestValueKey = Boolean(Object.keys(occurance.isRequired).reduce((a, b) => occurance.isRequired[a] > occurance.isRequired[b] ? a : b))
        const isPropertyRequired = requiredCount <= maxOccurance ? false : true
        if (highestValueKey != isPropertyRequired) {
            return {
                type: constants.SCHEMA_RESOLUTION_TYPE.OPTIONAL_TYPE,
                property: Object.keys(occurance.property)[0],
                conflicts: occurance.property,
                resolution: { "value": (isPropertyRequired), "type": "OPTIONAL" },
                values: [true, false],
                severity: "MEDIUM"
            }
        }
        else { return <Conflict>{} }

    }

    private countKeyValuePairs(arrayOfObjects: object[], key: string): Occurance {
        const result = _(arrayOfObjects)
            .flatMap(obj => _.toPairs(obj))
            .groupBy(([key, value]) => key)
            .mapValues(group => _.countBy(group, ([key, value]) => value))
            .value();
        return { property: result.property, dataType: result.dataType, isRequired: result.isRequired, path: result.path, absolutePath: result.absolutePath, format: result.formate };
    }

    private flattenSchema(sample: Map<string, any>): FlattenSchema[] {
        let array = new Array();
        const recursive = (data: any, path: string, requiredProps: string[], schemaPath: string) => {
            _.forEach(data, (value, key) => {
                if (_.isPlainObject(value) && (_.has(value, 'properties'))) {
                    array.push(this.flattenSchem(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`, value['format']))
                    recursive(value['properties'], `${path}.${key}`, value['required'], `${schemaPath}.properties.${key}`);
                } else {
                    if (_.isPlainObject(value)) {
                        if (value.type === 'array') {
                            array.push(this.flattenSchem(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`, value['format']))
                            if (_.has(value, 'items') && _.has(value["items"], 'properties')) {
                                recursive(value["items"]['properties'], `${path}.${key}[*]`, value["items"]['required'], `${schemaPath}.properties.items.${key}`);
                            } else {
                                array.push(this.flattenSchem(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`, value['format']))
                            }
                        } else {
                            array.push(this.flattenSchem(key, value.type, _.includes(requiredProps, key), `${path}.${key}`, `${schemaPath}.properties.${key}`, value['format']))
                        }
                    }
                }
            })
        }
        recursive(sample.get("properties"), "$", sample.get("required"), "$")
        return array
    }

    private flattenSchem(expr: string, objType: string, isRequired: boolean, path: string, schemaPath: string, formate: string): FlattenSchema {
        return <FlattenSchema>{ "property": expr, "dataType": objType, "isRequired": isRequired, "path": path, "absolutePath": schemaPath, "formate": formate }
    }

}
