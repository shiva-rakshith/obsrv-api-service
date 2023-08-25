import { NextFunction, Response } from "express";
import { incrementApiCalls, incrementFailedApiCalls, incrementSuccessfulApiCalls, setQueryResponseTime } from ".";

export const onRequest = ({ entity }: any) => (req: any, res: Response, next: NextFunction) => {
    const { id } = req;
    const startTime = Date.now();
    req.startTime = startTime;
    req.entity = entity;
    incrementApiCalls({ entity, id })
    next();
}

const getDuration = (startTime: number) => {
    const duration = startTime && (Date.now() - startTime);
    return duration || null
}

export const onSuccess = (req: any, res: Response) => {
    const { startTime, id, entity } = req;
    const duration = getDuration(startTime);
    duration && setQueryResponseTime(duration, { entity, id });
    incrementSuccessfulApiCalls({ entity, id })
}

export const onFailure = (req: any, res: Response) => {
    const { startTime, id, entity } = req;
    const duration = getDuration(startTime);
    duration && setQueryResponseTime(duration, { entity, id });
    incrementFailedApiCalls({ entity, id });
}
