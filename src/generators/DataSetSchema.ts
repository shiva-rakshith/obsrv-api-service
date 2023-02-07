import { inferSchema } from "@jsonhero/schema-infer";
import _ from "lodash";
import { SchemaUpdate } from "../models/DatasetModels";
import { ISchemaGenerator } from "../models/IngestionModels";
import { DataSetSuggestionService } from "./SchemaSuggestionService";
var jsonMerger = require("json-merger");

export class DataSetSchema implements ISchemaGenerator {
    private dataset: string;

    constructor(dataset: string, config: Map<string, any>) {
        this.dataset = dataset
    }

    generate(sample: Map<string, any>[]): any {
        const generatedSchema: Map<string, any>[] = _.map(sample, (value): any => inferSchema(value).toJSONSchema())
        return this.process(generatedSchema)
    }

    process(schemas: Map<string, any>[]) {
        const suggestionService = new DataSetSuggestionService(schemas)
        const mergedSchema: Map<string, any> = this.mergeSchema(schemas)
        const suggestedSchema = suggestionService.suggestSchema()
        // Get the Updated Schema from by comparing the merged schema and suggestedSchema
        const schemaToUpdate:SchemaUpdate[] = this.getSchemaPropToUpdate(suggestedSchema)
        const updatedSchema = this.updateSchema(mergedSchema, schemaToUpdate)
        
        // Generate the Suggestion Template
        /**
         * TODO - Define the templates
         * 
         */
        const suggestionTemplate = suggestionService.createSuggestionTemplate(suggestedSchema)

        // Configuration Suggestion
        const suggestedConfig = suggestionService.suggestConfig()

        return { "schema": updatedSchema, "suggestions": suggestionTemplate, "configurations": suggestedConfig }
    }


    mergeSchema(schema: Map<string, any>[]): Map<string, any> {
        return jsonMerger.mergeObjects(schema);
    }

    getSchemaPropToUpdate(schema: any):SchemaUpdate[] {
        return _.flattenDeep(
            schema.map((prop: any) => {
            return prop["schema"].map((obj:any) => {
                return obj.resolution.map((res:any) => {
                    return {
                        "property": res.fullPath.replace("$.", ""),
                        "conflictType": obj.conflictProperty,
                        "objectType": res.objectType,
                        "action": "UPDATE"
                     }
                })
            })
        }))
    }

    
    updateSchema(schema: any, updateProps: SchemaUpdate[]) {
        updateProps.forEach((value: SchemaUpdate) => {
            switch (value.conflictType) {
                case "objectType":
                    _.set(schema, `${value.property}.type`, value.objectType);
                    break;

                default:
                    console.warn("Unsupported Conflict Update")
                    break;
            }

        })
        return schema
    }
}