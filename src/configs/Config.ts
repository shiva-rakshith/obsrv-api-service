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

  "postgres": {
    "pg_config": {
      host: process.env.postgres_host || 'localhost',
      port: 5432,
      database: process.env.postgres_database || 'postgres',
      user: process.env.postgres_username || 'manjunathdavanam',
      password: process.env.postgres_password || 'Manju@123',
    }
  },

  "dataset_api": {
    "kafka": {
      "config": {
        "brokers": [`${process.env.kafka_host || 'localhost'}:${process.env.kafka_port || 9092}`],
        "clientId": "obsrv-apis",
        "retry": {
          "initialRetryTime": 1000,
          "retries": 3
        },
        "connectionTimeout": 3000
      },
      "topics": {
        "create": process.env.kafka_topic_create || "telemetry.ingest",
        "mutate": "telemetry.mutate"
      }

    }
  },
  "db_connector_config": {
    client: "postgresql",
    connection: {
      host: process.env.postgres_host || 'localhost',
      port: process.env.postgres_port || 5432,
      database: process.env.postgres_database || 'postgres',
      user: process.env.postgres_username || 'manjunathdavanam',
      password: process.env.postgres_password || 'Manju@123',
    }
  }

}