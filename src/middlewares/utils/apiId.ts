import { NextFunction, Request, Response } from "express";

const setApiId =
  (id: string) => (req: Request, res: Response, next: NextFunction) => {
    (req as any).id = id;
    next();
  };

export default setApiId;
