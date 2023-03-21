const Prometheus = require('prom-client');

// Create a new Prometheus Gauge for query response time
const queryResponseTimeMetric = new Prometheus.Gauge({
    name: 'node_query_response_time',
    help: 'The average response time for database queries'
});

// Create a new Prometheus Counter for total API calls
const totalApiCallsMetric = new Prometheus.Counter({
    name: 'node_total_api_calls',
    help: 'The total number of API calls made'
});

// Create a new Prometheus Gauge for API throughput
const apiThroughputMetric = new Prometheus.Gauge({
    name: 'node_api_throughput',
    help: 'The current number of API calls per second'
});

// Create a new Prometheus Counter for failed API calls
const failedApiCallsMetric = new Prometheus.Counter({
    name: 'node_failed_api_calls',
    help: 'The total number of Failed API calls made'
});


export {
    queryResponseTimeMetric,
    totalApiCallsMetric,
    apiThroughputMetric,
    failedApiCallsMetric
}