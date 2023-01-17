import axios from "axios";
import { config } from "../configs/config";

const URL = config.druidHost + ":" + config.druidPort;
const HTTPService = axios.create({
  baseURL: URL,
  timeout: 3000,
  headers: { "Content-Type": "application/json" }
});

export { HTTPService };
