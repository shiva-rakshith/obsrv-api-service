import { Kafka, Producer, KafkaConfig, CompressionTypes } from 'kafkajs'
import { IConnector } from "../models/IngestionModels"

export class KafkaConnector implements IConnector {
    private kafka: Kafka;
    public producer: Producer;
    constructor(config: KafkaConfig) {
        this.kafka = new Kafka(config)
        // TODO: Optimize the producer config
        this.producer = this.kafka.producer({
        })
    }
    async connect() {
       return await this.producer.connect()
    }
    async execute(topic: string, config: any) {
        // TODO: Handle acks (which should be 3 for durability) and compression types
        return await this.producer.send({
            topic: topic,
            messages: [{
                value: config.value
            }],
            compression: CompressionTypes.Snappy
        })
    }
    async close() {
        return await this.producer.disconnect()
    }
}