
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
  "telemetry_service_config": {
    level: process.env.telemetry_log_level || 'info',
    localStorageEnabled: process.env.telemetry_local_storage_enabled || 'true',
    dispatcher: process.env.telemetry_local_storage_type || 'kafka',
    telemetryProxyEnabled: process.env.telemetry_proxy_enabled,
    proxyURL: process.env.telemetry_proxy_url,
    proxyAuthKey: process.env.telemetry_proxy_auth_key,
    compression_type: process.env.telemetry_kafka_compression || 'none',
    filename: process.env.telemetry_file_filename || 'telemetry-%DATE%.log',
    maxSize: process.env.telemetry_file_maxsize || '100m',
    maxFiles: process.env.telemetry_file_maxfiles || '100',
    "kafka": {
      "config": {
        "brokers": [`${process.env.kafka_host || 'localhost'}:${process.env.kafka_port || 9092}`],
        "clientId": process.env.client_id || "obsrv-apis",
        "retry": {
          "initialRetryTime": process.env.kafka_initial_retry_time ? parseInt(process.env.kafka_initial_retry_time) : 3000,
          "retries": process.env.kafka_retries ? parseInt(process.env.kafka_retries) : 1
        },
        "connectionTimeout": process.env.kafka_connection_timeout ? parseInt(process.env.kafka_connection_timeout) : 5000
      },
      "topics": {
        "createDataset": `${process.env.system_env || 'local'}.ingest`,
        "createMasterDataset": `${process.env.system_env || 'local'}.masterdata.ingest`
      }
    }
  },
  "dataset_types": {
    normalDataset: "dataset",
    masterDataset: "master"
  },
  "redis_config": {
    "redis_host": process.env.redis_host || 'obsrv-redis-master.redis.svc.cluster.local',
    "redis_port": process.env.redis_port || 6379
  }
}