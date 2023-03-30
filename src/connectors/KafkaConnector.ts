import { Kafka, Producer, KafkaConfig, CompressionTypes, CompressionCodecs } from 'kafkajs'
import { IConnector } from "../models/IngestionModels"
const SnappyCodec = require('kafkajs-snappy')
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec

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
            messages: [
                {
                    value: config.value,
                },
            ],
            compression: CompressionTypes.Snappy,
        });
    }
    async close() {
        await this.producer.disconnect()
            .then(() => console.info("Kafka disconnected..."))
            .catch((err: Error) => console.error(`failed to disconnect kafka: ${err.message}`))
    }
}

 