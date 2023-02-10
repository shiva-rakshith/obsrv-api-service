import _ from "lodash";
import { config } from "../configs/config";
import { DataSetConfig, ProcessingConfig } from "../models/ConfigModels";
import { IngestionConfig } from "../models/IngestionModels";
import { ILimits } from "../models/QueryModels";
import { ConflictTypes } from "../models/SchemaModels";

export class ConfigService {
    /**
     * TODO: 
     *  1. analyse the schema and suggest rollup is required or not. - done
     *  2. analyse the schema and suggest the dedup property field. - done
     *  3. return the default basic druid configurations, processing configuration and querying configuration
     *  4. analyse the schema and return dedup is required or not.
     *  5. message size suggestion
     */

    public suggestConfig(conflicts: ConflictTypes[]): DataSetConfig {
        const suggestedConfig = this.analyzeConflicts(conflicts)
        return suggestedConfig
    }

    private analyzeConflicts(conflicts: ConflictTypes[]): DataSetConfig {
        const typeFormatsConflict: ConflictTypes[] = _.filter(conflicts, (o) => !_.isEmpty(o.formats));
        const ingestionConfig: IngestionConfig = this.ingestionConfig(typeFormatsConflict)
        const processingConfig: ProcessingConfig = this.processingConfig(typeFormatsConflict)
        const queryingConfig: ILimits = this.queryingConfig(typeFormatsConflict)
        return <DataSetConfig>{ "querying": queryingConfig, "ingestion": ingestionConfig, "processing": processingConfig }
    }

    private ingestionConfig(conflicts: ConflictTypes[]): IngestionConfig {
        const uuidConflicts = _.filter(conflicts, (o) => !_.isEmpty(o.formats.conflicts) && o.formats.conflicts.hasOwnProperty('uuid'));
        const isRollupRequired = _.isEmpty(uuidConflicts) ? true : false
        const dateSchemaFormat = ["date", "date-time"]
        const indexCol = this._getProperty(conflicts, dateSchemaFormat)
        var ingestionConfig = this.getDefaultIngestionConfig()
        ingestionConfig.granularitySpec.rollup = isRollupRequired
        if (!_.isEmpty(indexCol)) ingestionConfig.indexCol = indexCol;
        return ingestionConfig
    }

    private processingConfig(conflicts: ConflictTypes[]): ProcessingConfig {
        const dateSchemaFormat = ["uuid"]
        const dedupCol = this._getProperty(conflicts, dateSchemaFormat)
        var processingConfig = this.getDefaultProcessingConfig()
        processingConfig.dedupProperty = dedupCol
        return processingConfig
    }
    private queryingConfig(conflicts: ConflictTypes[]): ILimits {
        return this.getDefaultQueryingConfig()
    }

    private _getProperty(conflicts: ConflictTypes[], list: string[]) {
        return _.first(_(conflicts)
            .filter((obj) => {
                const conflictKey = Object.keys(obj.formats.conflicts)[0];
                return _.includes(list, conflictKey);
            })
            .sortBy((obj) => -obj.formats.conflicts[Object.keys(obj.formats.conflicts)[0]])
            .value().map(key => key.formats.property)) || ""
    }
    private getDefaultIngestionConfig(): IngestionConfig {
        return <IngestionConfig>config.datasetConfig.ingestion
    }

    private getDefaultProcessingConfig(): ProcessingConfig {
        return <ProcessingConfig>config.datasetConfig.processing
    }

    private getDefaultQueryingConfig(): ILimits {
        return <ILimits>config.datasetConfig.querying
    }
}