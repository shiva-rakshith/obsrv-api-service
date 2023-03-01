export const config = {
  "api_port": process.env.api_port || 3000,
  "query_api": {
    "druid": {
      "host": process.env.druid_host || "http://localhost",
      "port": process.env.druid_port || 8888,
      "sql_query_path": "/druid/v2/sql/",
      "native_query_path": "/druid/v2"
    }
  },
  "dataset_api": {
    "kafka": {
      "config": {
        "brokers": [`${process.env.kafka_host || 'localhost'}:${process.env.kafka_port || 9092}`],
        "clientId": process.env.clientId || "obsrv-apis",
        "retry": {
          "initialRetryTime": process.env.kafka_initial_retry_time ? parseInt(process.env.kafka_initial_retry_time) : 3000,
          "retries": process.env.kafka_retries ? parseInt(process.env.kafka_retries) : 5
        },
        "connectionTimeout": process.env.kafka_connection_timeout ? parseInt(process.env.kafka_connection_timeout) : 5000
      },
      "topics": {
        "create": `${process.env.system_env || 'local'}.ingest`,
        "mutate": `${process.env.system_env || 'local'}.mutation`
      }
    }
  },
  "db_connector_config": {
    client: "postgresql",
    connection: {
      host: process.env.postgres_host || 'localhost',
      port: process.env.postgres_port || 5432,
      database: process.env.postgres_database || 'sb-obsrv',
      user: process.env.postgres_username || 'obsrv',
      password: process.env.postgres_password || '5b-0b5rv',
    }
  }

}