import httpStatus from "http-status";
import _ from "lodash";
import { SchemaGenerationException } from "../../exceptions/CustomExceptions";
import { inferSchema } from "@jsonhero/schema-infer";

export class SchemaInference {

    public inferSchema(sample: any) {
        return _.map(sample, (value): any => inferSchema(value).toJSONSchema({ includeSchema: false }))
    }

    public inferBatchSchema(sample: Map<string, any>[], extractionKey: string) {
        return _.flatMap(sample, (value) => {
            if (extractionKey) {
                const extracted = _.get(value, extractionKey);
                if (extracted) {
                    return this.inferSchema(extracted);
                } else {
                    throw new SchemaGenerationException('Unable to extract the batch data.', httpStatus.BAD_REQUEST);
                }
            } else {
                throw new SchemaGenerationException('Extraction key not found.', httpStatus.BAD_REQUEST);
            }
        })
    }

    // private getSchemaInference() {
    //     var schemaInfer = require("jsonhero/schema-infer");
    //     return schemaInfer
    // }


}