import _ from "lodash";
import { DataSetConfig } from "../../models/ConfigModels";
import { ISchemaGenerator } from "../../models/DatasetModels";
import { ConflictTypes, DatasetSchemaConfig, DatasetSchemaResponse, SuggestionsTemplate } from "../../models/SchemaModels";
import constants from "../../resources/Constants.json";
import { ConfigSuggestionGenerator } from "../ConfigSuggestion";
import { SchemaHandler } from "./SchemaHandler";
import { SchemaInference } from "./SchemaInference";
import { SuggestionTemplate } from "./SuggestionTemplate";

export class DatasetSchemaGenerator implements ISchemaGenerator {
    private dataset: string;
    private config: DatasetSchemaConfig;
    private suggestionTemplate: SuggestionTemplate = <SuggestionTemplate>{}
    private schemaInference: SchemaInference
    private schemaHandler: SchemaHandler;
    private configSuggestor: ConfigSuggestionGenerator

    constructor(dataset: string, config: DatasetSchemaConfig) {
        this.dataset = dataset
        this.config = config
        this.schemaInference = new SchemaInference()
        this.schemaHandler = new SchemaHandler()
        this.suggestionTemplate = new SuggestionTemplate()
        this.configSuggestor = new ConfigSuggestionGenerator(dataset)
    }

    generate(sample: Map<string, any>[]): any {
        const { isBatch = false, extractionKey } = this.config;
        let schema = isBatch ? this.schemaInference.inferBatchSchema(sample, extractionKey) : this.schemaInference.inferSchema(sample);
        return this.process(schema);
    }

    process(schemas: Map<string, any>[]): DatasetSchemaResponse {
        const mergedSchema = this.schemaHandler.merge(schemas)
        const report: ConflictTypes[] = this.schemaHandler.process(schemas)
        const resolvedSchema = this.resolveConflicts(mergedSchema, report)
        const suggestionTemplate: SuggestionsTemplate[] = this.suggestionTemplate.createSuggestionTemplate(report)
        const updatedSchema = this.schemaHandler.update(resolvedSchema, suggestionTemplate, "suggestions")
        const suggestedConfig: DataSetConfig = this.configSuggestor.suggestConfig(report)
        return <DatasetSchemaResponse>{ "schema": updatedSchema, "configurations": suggestedConfig }
    }

    private resolveConflicts(schema: any, updateProps: ConflictTypes[]): any {
        updateProps.forEach((value: ConflictTypes) => {
            if (!_.isEmpty(value.schema) || !_.isEmpty(value.required)) {
                switch (value.schema.type || value.required.type) {
                    case constants.SCHEMA_RESOLUTION_TYPE.DATA_TYPE:
                        return this.schemaHandler.update(schema, value, "datatype")
                    case constants.SCHEMA_RESOLUTION_TYPE.OPTIONAL_TYPE:
                        return this.schemaHandler.update(schema, value, "required")
                    default:
                        console.warn("Unsupported Conflict Type")
                        break;
                }
            } else { console.info(`Conflicts not found ${JSON.stringify(value)}`) }
        })
        return schema
    }

}
