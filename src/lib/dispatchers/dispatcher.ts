import winston, { Logger, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { KafkaDispatcher } from "./kafka-dispatcher";

interface DispatcherOptions {
    dispatcher: "kafka" | "file" | "console";
    [key: string]: any;
}

interface CustomConsoleTransportOptions extends transports.ConsoleTransportOptions {
    stringify?: (obj: any) => string;
}

const defaultFileOptions: DailyRotateFile.DailyRotateFileTransportOptions = {
    filename: "dispatcher-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "100m",
    maxFiles: "100",
    zippedArchive: true,
    json: true,
};

class Dispatcher {
    private logger: Logger;
    private options!: DispatcherOptions;

    constructor(options: DispatcherOptions) {
        if (!options) throw new Error("Dispatcher options are required");
        this.logger = winston.createLogger({ level: "info" });
        this.options = options;
        if (this.options.dispatcher == "kafka") {
            this.logger.add(new KafkaDispatcher());
            console.log("Kafka transport enabled !!!");
        } else if (this.options.dispatcher == "file") {
            const config = { ...defaultFileOptions, ...this.options };
            this.logger.add(new DailyRotateFile(config));
            console.log("File transport enabled !!!");
        } else {
            // Log to console
            this.options.dispatcher = "console";
            const config: CustomConsoleTransportOptions = { stringify: (obj: any) => JSON.stringify(obj), ...this.options };
            this.logger.add(new winston.transports.Console(config));
            console.log("Console transport enabled !!!");
        }
    }

    dispatch(mid: string, message: string, callback?: () => void): any {
        return this.logger.log("info", message, { mid }, callback)
    }

    health(callback: (status: boolean) => void): void {
        if (this.options.dispatcher === "kafka") {
            const kafkaTransport = this.logger.transports.find((transport: any) => transport instanceof KafkaDispatcher) as KafkaDispatcher;
            kafkaTransport.health(callback);
        } else if (this.options.dispatcher === "console") {
            callback(true);
        } else {
            // need to add health method for file/cassandra
            callback(false);
        }
    }
}

export { Dispatcher };
