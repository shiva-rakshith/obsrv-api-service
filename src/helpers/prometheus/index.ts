import { NextFunction, Request, Response } from 'express';
import client from 'prom-client';
import { apiThroughputMetric, queryResponseTimeMetric, totalApiCallsMetric } from './metrics'

const register = new client.Registry();

//register to collect all the default metrics
client.collectDefaultMetrics({ register });
client.register.setDefaultLabels({ release: 'monitoring' });

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
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics()
    res.send(metrics).end();
}

export {
    client,
    scrapMetrics,
    metricsHandler
}

