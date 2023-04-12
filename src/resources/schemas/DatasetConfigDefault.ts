import { config } from "../../configs/Config";

export const defaultConfig = {
    "master": {
        "validation_config": {
            "validate": true,
            "mode": "Strict"
        },
        "extraction_config": {
            "is_batch_event": false,
            "extraction_key": "",
            "dedup_config": {
                "drop_duplicates": true,
                "dedup_key": "id",
                "dedup_period": 3
            }
        },
        "dedup_config": {
            "drop_duplicates": true,
            "dedup_key": "id",
            "dedup_period": 3
        },
         "router_config": {
            "topic": ""
        },
        "dataset_config": {
            "data_key": "",
            "timestamp_key": "",
            "exclude_fields": [],
            "entry_topic": config.telemetry_service_config.kafka.topics.createMasterDataset,
            "redis_db_host": config.redis_config.redis_host,
            "redis_db_port": config.redis_config.redis_port,
            "index_data": false
        },
        "status": "ACTIVE",
        "created_by": "SYSTEM",
        "updated_by": "SYSTEM"
    },
    "dataset": {
        "validation_config": {
            "validate": true,
            "mode": "Strict"
        },
        "extraction_config": {
            "is_batch_event": false,
            "extraction_key": "",
            "dedup_config": {
                "drop_duplicates": true,
                "dedup_key": "id",
                "dedup_period": 3
            }
        },
        "dedup_config": {
            "drop_duplicates": true,
            "dedup_key": "id",
            "dedup_period": 3
        },
        "router_config": {
            "topic": ""
        },
        "dataset_config": {
            "data_key": "",
            "timestamp_key": "",
            "exclude_fields": [],
            "entry_topic": config.telemetry_service_config.kafka.topics.createDataset,
            "redis_db_host": config.redis_config.redis_host,
            "redis_db_port": config.redis_config.redis_port,
            "index_data": true
        },
        "status": "ACTIVE",
        "created_by": "SYSTEM",
        "updated_by": "SYSTEM"
    },
    "sourceConfig": {
        "connector_type": '',
        "connector_config": {},
        "status": 'ACTIVE',
        "connector_stats": {},
        "created_by": 'SYSTEM',
        "updated_by": 'SYSTEM'
    },
    "transformations": {
        "field_key": "",
        "transformation_function": { "type": "", "condition": { "type": "", "expr": "" }, "expr": "" },
        "status": 'ACTIVE',
        "created_by": 'SYSTEM',
        "updated_by": 'SYSTEM'
    }
}