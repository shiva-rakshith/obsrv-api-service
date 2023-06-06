const maxDateRange = process.env.MAX_DATE_RANGE ? parseInt(process.env.MAX_DATE_RANGE) : 30 // in days
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
          "maxDateRange": maxDateRange
        },
        "scan": {
          "maxDateRange": maxDateRange
        },
        "search": {
          "maxDateRange": maxDateRange
        },
        "timeBoundary": {
          "maxDateRange": maxDateRange
        },
        "timeseries": {
          "maxDateRange": maxDateRange
        },
        "topN": {
          "maxDateRange": maxDateRange
        }
      }
    },
    {
      "dataset": "summary-events",
      "queryRules": {
        "groupBy": {
          "maxDateRange": maxDateRange
        },
        "scan": {
          "maxDateRange": maxDateRange
        },
        "search": {
          "maxDateRange": maxDateRange
        },
        "timeBoundary": {
          "maxDateRange": maxDateRange
        },
        "timeseries": {
          "maxDateRange": maxDateRange
        },
        "topN": {
          "maxDateRange": maxDateRange
        }
      }
    }
  ]
}
