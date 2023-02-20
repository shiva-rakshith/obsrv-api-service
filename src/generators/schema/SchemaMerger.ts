
export class SchemaMerger {

    mergeSchema(schema: Map<string, any>[]): Map<string, any> {
        return this.getMerger().mergeObjects(schema);
    }

    private getMerger() {
        var jsonMerger = require("json-merger");
        return jsonMerger
    }
}