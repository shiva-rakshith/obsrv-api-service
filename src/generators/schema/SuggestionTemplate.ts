import _ from "lodash"
import { SchemaSuggestionTemplate } from "../../helpers/suggestions"
import { SuggestionsTemplate, Conflict, Suggestion } from "../../models/SchemaModels"

export class SuggestionTemplate {

    public createSuggestionTemplate(sample: any[]): SuggestionsTemplate[] {
        return _.map(sample, (value, key) => {
            const dataTypeSuggestions = this.getSchemaMessageTempalte(value["schema"])
            const requiredSuggestions = this.getRequiredMessageTemplate(value["required"])
            const formatSuggestions = this.getPropertyFormatTemplate(value["formats"])
            return <SuggestionsTemplate>{
                "property": value.absolutePath,
                "suggestions": _.reject([dataTypeSuggestions, requiredSuggestions, formatSuggestions], _.isEmpty)
            }
        })
    }




    private getSchemaMessageTempalte(object: Conflict): Suggestion {
        if (_.isEmpty(object)) return <Suggestion>{}
        const conflictMessage = SchemaSuggestionTemplate.getSchemaDataTypeMessage(object.conflicts, object.property)
        return <Suggestion>{
            message: conflictMessage,
            advice: SchemaSuggestionTemplate.TEMPLATES.SCHEMA_SUGGESTION.CREATE.DATATYPE_PROPERTY.ADVICE,
            resolutionType: object.resolution["type"],
            severity: object.severity
        }
    }

    public getPropertyFormatTemplate(object: Conflict): Suggestion {
        if (_.isEmpty(object)) return <Suggestion>{}
        const conflictMessage = SchemaSuggestionTemplate.getSchemaFormatMessage(object.conflicts, object.property)
        const adviceObj = SchemaSuggestionTemplate.getSchemaFormatAdvice(object.conflicts)
        return <Suggestion>{
            message: conflictMessage,
            advice: adviceObj.advice,
            resolutionType: object.resolution["type"],
            severity: object.severity
        }
    }

    public getRequiredMessageTemplate(object: Conflict): Suggestion {
        if (_.isEmpty(object)) return <Suggestion>{}
        const conflictMessage = SchemaSuggestionTemplate.getSchemaRequiredTypeMessage(object.conflicts, object.property)
        return <Suggestion>{
            message: conflictMessage,
            advice: SchemaSuggestionTemplate.TEMPLATES.SCHEMA_SUGGESTION.CREATE.OPTIONAL_PROPERTY.ADVICE,
            resolutionType: object.resolution["type"],
            severity: object.severity

        }
    }
}