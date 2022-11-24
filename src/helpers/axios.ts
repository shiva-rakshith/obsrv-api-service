import axios from "axios";
import { config } from "../config/config";

const URL = config.druidHost + ":" + config.druidPort;
const druidInstance = axios.create({
  baseURL: URL,
  timeout: 3000,
  headers: { "Content-Type": "application/json" },
});

export { druidInstance };
