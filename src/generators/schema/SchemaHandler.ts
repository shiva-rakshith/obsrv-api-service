import _ from "lodash";
import { ConflictTypes, FlattenSchema, SuggestionsTemplate } from "../../models/SchemaModels";
import { SchemaMerger } from "./SchemaMerger";
import { SchemaAnalyser } from "./SchemaAnalyser";

export class SchemaHandler {
    private typeToMethod = {
        required: this.updateRequiredProp,
        datatype: this.updateDataTypes,
        suggestions: this.setSuggestions
    }

    public process(schema: Map<string, any>[]): ConflictTypes[] {
        const schemaAnalyser = new SchemaAnalyser(schema)
        return schemaAnalyser.analyseSchema()
    }

    public merge(schema: Map<string, any>[]): Map<string, any> {
        const schemaMerger = new SchemaMerger()
        return schemaMerger.mergeSchema(schema)
    }

    public update(schema: any, property: any, type: keyof typeof this.typeToMethod) {
        const method = this.typeToMethod[type];
        return method(schema, property);
    }

    private updateDataTypes(schema: any, conflict: ConflictTypes): any {
        const { absolutePath, schema: { resolution: { value } } } = conflict;
        return _.set(schema, `${absolutePath}`, {
            ...schema[absolutePath],
            ...{
                type: conflict.schema.resolution["value"],
                oneof: conflict.schema.values.map(key => ({ type: key })),
            }
        });
    }

    private updateRequiredProp(schema: any, value: ConflictTypes): any {
        const subStringArray: string[] = _.split(value.absolutePath, '.');
        const subString: string = _.join(_.slice(subStringArray, 0, subStringArray.length - 2), '.');
        const path: string = _.isEmpty(subString) ? "required" : `${subString}.required`
        const requiredList: string[] = _.get(schema, path)
        const newProperty: string = value.required.property
        value.required.resolution.value ? _.concat(_.get(schema, path), value.required.property) : _.pull(requiredList, newProperty)
        return _.set(schema, path, _.uniq(requiredList))
    }

    private setSuggestions(schema: any, suggestedTemplate: SuggestionsTemplate[]): any {
        suggestedTemplate.forEach(({ property, suggestions }) => {
            _.set(schema, `${property}.suggestions`, suggestions);
        });
        return schema;
    }

}