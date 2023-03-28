import os from 'os'

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
        "clientId": process.env.client_id || "obsrv-apis",
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
  },
  envVariables: {
    level: process.env.telemetry_log_level || 'info',
    localStorageEnabled: process.env.telemetry_local_storage_enabled || 'true',
    telemetryProxyEnabled: process.env.telemetry_proxy_enabled,
    dispatcher: process.env.telemetry_local_storage_type || "kafka",
    proxyURL: process.env.telemetry_proxy_url,
    proxyAuthKey: process.env.telemetry_proxy_auth_key,
    encodingType: process.env.telemetry_encoding_type,
    kafkaHost: process.env.telemetry_kafka_broker_list,
    topic: process.env.telemetry_kafka_topic,
    compression_type: process.env.telemetry_kafka_compression || 'none',
    filename: process.env.telemetry_file_filename || 'telemetry-%DATE%.log',
    maxSize: process.env.telemetry_file_maxsize || '100m',
    maxFiles: process.env.telemetry_file_maxfiles || '100',
    partitionBy: process.env.telemetry_cassandra_partition_by || 'hour',
    keyspace: process.env.telemetry_cassandra_keyspace,
    contactPoints: (process.env.telemetry_cassandra_contactpoints || 'localhost').split(','),
    cassandraTtl: process.env.telemetry_cassandra_ttl,
    port: process.env.telemetry_service_port || '9001',
    threads: process.env.telemetry_service_threads || `${os.cpus().length}`,
  }
}