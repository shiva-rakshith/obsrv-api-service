
export interface DbConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export interface DbConnectorConfig {
    client: string;
    connection: DbConfig;
}

export interface IRelation {
    getValues(): object;
    setValues(): object;
    removeNullValues: object;
}