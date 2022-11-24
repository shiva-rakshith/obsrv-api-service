import { AxiosResponse } from "axios"
import { Request, Response } from "express"

class ResponseFormatter {


    public static handler(req: Request, res: Response, result: AxiosResponse) {

        res.status(result.status).json(this.refactorResponse({ "id": (req as any).id, "result": result.data }))
    }

    public static refactorResponse({ id = "druid.api", ver = "v1", params = { status: "success", errmsg: "No Error" }, responseCode = "OK", result = {} }) {
        return {
            id,
            ver,
            "ts": Date.now(),
            params,
            responseCode,
            result
        }
    }
}

export { ResponseFormatter }