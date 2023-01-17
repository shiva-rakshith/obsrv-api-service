import axios from "axios";
import { config } from "../configs/config";

//const URL = config.druidHost + ":" + config.druidPort;

export class HTTPConnector {
  [x: string]: any;
  constructor(url: string){
   return axios.create({
      url: url,
      timeout: 3000,
      headers: { "Content-Type": "application/json" }
    });
  }

  // fetch (){
  //   axios.create({
  //     baseURL: URL,
  //     timeout: 3000,
  //     headers: { "Content-Type": "application/json" }
  //   });
  // }

}


// const HTTPService = 

// export { HTTPService };
