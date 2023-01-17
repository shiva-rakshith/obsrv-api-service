import axios, { AxiosInstance } from "axios";
export class HTTPConnector {
  private url: string;
  constructor(url: string) {
    this.url = url
  }

  init(): AxiosInstance {
    return axios.create({
      url: this.url,
      timeout: 3000,
      headers: { "Content-Type": "application/json" }
    });
  }
}


