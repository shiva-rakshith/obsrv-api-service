
import { Client, ClientConfig } from "pg"

export class PostgresConnector {
    private config : ClientConfig
    private client: Client

    constructor(config: ClientConfig){
        this.config = config;
        this.client = new Client(config)
    }

    async connect() {
        return await this.client.connect()
    }

}
