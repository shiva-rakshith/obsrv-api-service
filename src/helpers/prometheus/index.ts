import { NextFunction, Request, Response } from 'express';
import client from 'prom-client';
import {
    queryResponseTimeMetric,
    totalApiCallsMetric,
    apiThroughputMetric,
    failedApiCallsMetric
} from './metrics'

const metrics = [queryResponseTimeMetric, totalApiCallsMetric, apiThroughputMetric, failedApiCallsMetric];

const register = new client.Registry();

const configureRegistry = (register: client.Registry) => {
    client.collectDefaultMetrics({ register });
    register.setDefaultLabels({ release: 'monitoring' });
    metrics.forEach(metric => {
        register.registerMetric(metric);
    })
}

const incrementApiCalls = () => totalApiCallsMetric.inc();

const setQueryResponseTime = (res: Response, startTime: number) => {
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        queryResponseTimeMetric.set(duration);
    })
}

// middleware which will intercept requests and calculate the metrics
const scrapMetrics = (config: Record<string, any> = {}) => (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    incrementApiCalls();
    setQueryResponseTime(res, startTime);
    next();
}

// controller to expose metrics
const metricsHandler = async (req: Request, res: Response, next: NextFunction) => {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics()
    res.status(200).send(metrics);
}


configureRegistry(register);

export {
    client,
    scrapMetrics,
    metricsHandler
}

