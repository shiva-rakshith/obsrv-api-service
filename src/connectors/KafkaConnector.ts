import { IConnector } from "../models/IngestionModels";
const telemetryService = require('../lib/services/TelemetryService')
import { kafkaConnector } from "../routes/Router";

export class KafkaConnector {
    // private kafkaDispatcher: KafkaDispatcher
    // public producer: any
    // constructor(kafka_options: any) {
    //     this.kafkaDispatcher = new KafkaDispatcher({
    //         kafkaBrokers: kafka_options.config.brokers,
    //     })
    //     this.producer = this.kafkaDispatcher.producer
    // }

    async connect() {
        // await this.kafkaDispatcher.isReady();
    }

    async execute(req: any, res: any) {
        await telemetryService.dispatch(req, res)
    }

    close() {
        //TODO
    }
}
