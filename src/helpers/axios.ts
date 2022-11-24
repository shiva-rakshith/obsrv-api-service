import axios from 'axios'
 
const druidInstance = axios.create({
    baseURL: 'http://localhost:8082',
    timeout: 3000,
    headers: {"Content-Type": "application/json"}
  })
  

export { druidInstance }