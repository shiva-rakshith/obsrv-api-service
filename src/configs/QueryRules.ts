export const queryRules = {
  "common": {
    "maxResultThreshold": process.env.MAX_QUERY_THRESHOLD ? parseInt(process.env.MAX_QUERY_THRESHOLD) : 5000,
    "maxResultRowLimit":  process.env.MAX_QUERY_LIMIT  ? parseInt(process.env.MAX_QUERY_LIMIT) : 5000
  },
  "rules": [
    {
      "dataset": "telemetry-events",
      "queryRules": {
        "groupBy": {
          "maxDateRange": 30
        },
        "scan": {
          "maxDateRange": 30
        },
        "search": {
          "maxDateRange": 30
        },
        "timeBoundary": {
          "maxDateRange": 30
        },
        "timeseries": {
          "maxDateRange": 30
        },
        "topN": {
          "maxDateRange": 30
        }
      }
    },
    {
      "dataset": "summary-events",
      "queryRules": {
        "groupBy": {
          "maxDateRange": 30
        },
        "scan": {
          "maxDateRange": 30
        },
        "search": {
          "maxDateRange": 30
        },
        "timeBoundary": {
          "maxDateRange": 30
        },
        "timeseries": {
          "maxDateRange": 30
        },
        "topN": {
          "maxDateRange": 30
        }
      }
    }
  ]
}
