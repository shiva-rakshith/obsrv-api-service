import { IConnector } from "../models/IngestionModels";
const telemetryService = require('../lib/services/TelemetryService')
import { kafkaConnector } from "../routes/Router";

export class KafkaConnector {


    async connect() {
        throw new Error("Method not implemented.");
    }

    async execute(req: any, res: any) {
        return await telemetryService.dispatch(req, res)
    }

    close() {
        throw new Error("Method not implemented.");
    }
}
