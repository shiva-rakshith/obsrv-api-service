import _ from "lodash";
import { DataSetConfig, DatasetProcessing } from "../models/ConfigModels";
import { IngestionConfig } from "../models/IngestionModels";
import { ConflictTypes } from "../models/SchemaModels";

export class ConfigSuggestionGenerator {
    /**
     * Responsiblities : 
     *  1. Suggest rollup is required or not. - done
     *  2. Suggest the dedup property fields. - done
     */
    private dataset: string
    constructor(dataset: string) {
        this.dataset = dataset
    }

    public suggestConfig(conflicts: ConflictTypes[]): DataSetConfig {
        const suggestedConfig = this.analyzeConflicts(conflicts)
        return suggestedConfig
    }

    private analyzeConflicts(conflicts: ConflictTypes[]): DataSetConfig {
        const typeFormatsConflict: ConflictTypes[] = _.filter(conflicts, (o) => !_.isEmpty(o.formats));
        const ingestionConfig: IngestionConfig = this.ingestionConfig(typeFormatsConflict)
        const processingConfig: DatasetProcessing = this.processingConfig(typeFormatsConflict)
        return <DataSetConfig>{ "ingestion": ingestionConfig, "processing": processingConfig }
    }

    private ingestionConfig(conflicts: ConflictTypes[]): any {
        const indexCols = _.filter(conflicts, (o) => o.formats.resolution["type"] === "INDEX").map(v => v.formats.property)
        const isRollupRequired = _.isEmpty(_.filter(conflicts, (o) => o.formats.resolution["type"] === "DEDUP")) ? true : false
        return { "index": indexCols, "rollup": [isRollupRequired] }
    }

    private processingConfig(conflicts: ConflictTypes[]): any {
        const dedup = _.filter(conflicts, (o) => o.formats.resolution["type"] === "DEDUP").map(v => v.formats.property)
        return { "dedupKeys": dedup, dropDuplicates: ["Yes", "No"] }
    }
}