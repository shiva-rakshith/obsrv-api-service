# Obsrv API Service

   *	Dataset APIs
   *	Datasource APIs
   *	Dataset source config APIs
   *	Data IN API  
   *	Query APIs

To start API service:
   * npm install
   * npm run start

Default Configurations in API Settings:

These configurations can be modified as needed to customize the behavior of the system.

| Configuration            | Description                                                    | Default Value        |
|--------------------------|----------------------------------------------------------------|----------------------|
| system_env               | Environment in which the system is running.                     | local                |
| api port                 | Port on which the API server should listen for incoming requests.| 3000                 |
| body_parser_limit        | Maximum size limit for parsing request bodies.                  | 100mb                |
| druid_host               | Hostname or IP address of the Druid server.                     | http://localhost     |
| druid_port               | Port number on which the Druid server is running.               | 8888                 |
| postgres_host            | Hostname or IP address of the PostgreSQL database server.       | localhost            |
| postgres_port            | Port number on which the PostgreSQL server is running.          | 5432                 |
| postgres_database        | Name of the PostgreSQL database to connect to.                  | sb-obsrv             |
| postgres_username        | Username to use when connecting to the PostgreSQL database.     | obsrv                |
| postgres_password        | Password to use when connecting to the PostgreSQL database.     | 5b-0b5rv            |
| kafka_host               | Hostname or IP address of the Kafka server.                     | localhost            |
| kafka_port               | Port number on which the Kafka server is running.               | 9092                 |
| client_id                | Client ID for authentication or identification purposes.        | obsrv-apis           |
| redis_host               | Hostname or IP address of the Redis server.                     | localhost            |
| redis_port               | Port number on which the Redis server is running.               | 6379                 |
| exclude_datasource_validation | List of datasource names that should be excluded from validation. | ["system-stats", "masterdata-system-stats"] |
| MAX_QUERY_THRESHOLD      | Maximum threshold value for queries.                            | 5000                 |
| MAX_QUERY_LIMIT          | Maximum limit value for queries.                                | 5000                 |
| MAX_DATE_RANGE           | Maximum date range value for queries                            | 30                   |