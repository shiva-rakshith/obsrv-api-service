import { IConnector } from "../models/IngestionModels";
import { KafkaDispatcher } from "./KafkaDispatcher";


export class KafkaConnector implements IConnector {
    private kafkaDispatcher: KafkaDispatcher
    public producer: any
    constructor(kafka_options: any) {
        this.kafkaDispatcher = new KafkaDispatcher({
            kafkaBrokers: kafka_options.config.brokers,
        })
        this.producer = this.kafkaDispatcher.producer
    }

    async connect() {
        await this.kafkaDispatcher.isReady();
    }

    async execute(topic: string, config: any) {
        return new Promise<void>((resolve, reject) => {
            this.kafkaDispatcher.health((isHealthy: boolean) => {
                if (isHealthy) {
                    console.log('Telemetry API is healthy');
                    this.kafkaDispatcher.log({ "topic": topic, "message": config.value })
                        .then(() => {
                            console.log('Log successful');
                            resolve();
                        })
                        .catch((err: Error) => {
                            console.log('Log error:', err);
                            reject(err);
                        });
                } else {
                    console.log('Telemetry API is unhealthy');
                    reject(new Error('Kafka dispatcher is not healthy'));
                }
            });
        });
    }
    
    

    close() {
        //TODO
    }
}
