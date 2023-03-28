import { v1 as uuidv1 } from 'uuid';
import { Request, Response } from 'express';
import request from 'request';
import { Dispatcher } from '../dispatchers/dispatcher';
import { config } from '../configs/Config';

interface Message {
  did?: string;
  channel?: string;
  pid?: string;
  mid?: string;
  syncts?: number;
  [key: string]: any;
}

interface TelemetryConfig {
  localStorageEnabled: string;
  telemetryProxyEnabled: string;
  proxyAuthKey: string;
  proxyURL: string;
  [key: string]: any;
  dispatcher: "kafka" | "file" | "console"
}

class TelemetryService {
  private config: any;
  private dispatcher: Dispatcher | undefined;

  constructor(DispatcherClass: typeof Dispatcher, config: any) {
    this.config = config;
    this.dispatcher = this.config.localStorageEnabled === 'true' ? new DispatcherClass(config) : undefined;
  }

  public dispatch(req: Request, res: Response): void {
    const message: Message = req.body;
    message.did = req.get('x-device-id');
    message.channel = req.get('x-channel-id');
    message.pid = req.get('x-app-id');
    if (!message.mid) message.mid = uuidv1();
    message.syncts = new Date().getTime();
    const data = JSON.stringify(message);
    if (this.config.localStorageEnabled === 'true' || this.config.telemetryProxyEnabled === 'true') {
      if (this.config.localStorageEnabled === 'true' && this.config.telemetryProxyEnabled !== 'true') {
        // Store locally and respond back with proper status code
        this.dispatcher!.dispatch(message.mid, data, this.getRequestCallBack(req, res))
      } else if (this.config.localStorageEnabled === 'true' && this.config.telemetryProxyEnabled === 'true') {
        // Store locally and proxy to the specified URL. If the proxy fails ignore the error as the local storage is successful. Do a sync later
        const options = this.getProxyRequestObj(req, data);
        request.post(options, (err: any, data: any) => {
          if (err) console.error('Proxy failed:', err);
          else console.log('Proxy successful!  Server responded with:', data.body);
        });
        return this.dispatcher!.dispatch(message.mid, data);
      } else if (this.config.localStorageEnabled !== 'true' && this.config.telemetryProxyEnabled === 'true') {
        // Just proxy
        const options = this.getProxyRequestObj(req, data);
        request.post(options, this.getRequestCallBack(req, res));
      }
    } else {
      this.sendError(res, { id: 'api.telemetry', params: { err: 'Configuration error' } });
    }
  }

  public health(req: Request, res: Response): void {
    if (this.config.localStorageEnabled === 'true') {
      this.dispatcher!.health((healthy) => {
        if (healthy)
          this.sendSuccess(res, { id: 'api.health' });
        else
          this.sendError(res, { id: 'api.health', params: { err: 'Telemetry API is unhealthy' } });
      })
    } else if (this.config.telemetryProxyEnabled === 'true') {
      this.sendSuccess(res, { id: 'api.health' });
    } else {
      this.sendError(res, { id: 'api.health', params: { err: 'Configuration error' } });
    }
  }

  public getRequestCallBack(req: Request, res: Response): any {
    return (err: any, data: any) => {
      if (err) {
        this.sendError(res, { id: 'api.telemetry', params: { err: err } });
      } else {
        console.log("success")
        this.sendSuccess(res, { id: 'api.telemetry' });
      }
    };
  }

  private sendError(res: Response, options: any) {
    const resObj: any = {
      id: options.id,
      ver: options.ver || '1.0',
      ets: new Date().getTime(),
      params: options.params || {},
      responseCode: options.responseCode || 'SERVER_ERROR',
    };
    res.status(500);
    res.json(resObj);
  }

  private sendSuccess(res: Response, options: any) {
    console.log("success called")
    const resObj: any = {
      id: options.id,
      ver: options.ver || '1.0',
      ets: new Date().getTime(),
      params: options.params || {},
      responseCode: options.responseCode || 'SUCCESS',
    };
    res.status(200);
    res.json(resObj);
  }

  public getProxyRequestObj(req: Request, data: any): any {
    const headers: any = { 'authorization': 'Bearer ' + this.config.proxyAuthKey };
    if (req.get('content-type')) headers['content-type'] = req.get('content-type');
    if (req.get('content-encoding')) headers['content-encoding'] = req.get('content-encoding');
    return {
      url: this.config.proxyURL,
      headers: headers,
      body: data,
    };
  }
}

export default new TelemetryService(Dispatcher, config.envVariables);
