import { KafkaClient, HighLevelProducer, KafkaClientOptions } from 'kafka-node'
import TransportStream from 'winston-transport'
import _ from 'lodash'


interface KafkaDispatcherOptions extends TransportStream.TransportStreamOptions {
  kafkaBrokers: string[]
  compression?: 'none' | 'gzip' | 'snappy'
}

interface CustomKafkaClientOptions extends KafkaClientOptions {
  topic: any
  compression: string
}

class KafkaDispatcher extends TransportStream {
  private options: CustomKafkaClientOptions
  private compression_attribute: number
  private client: KafkaClient
  public producer: HighLevelProducer

  constructor(options?: KafkaDispatcherOptions) {
    super(options)
    this.options = _.defaults(options, {
      kafkaBrokers: ['localhost:9092'],
      maxInFlightRequests: 100,
      topic: 'test',
      compression: 'none'
    }) as CustomKafkaClientOptions

    if (this.options.compression === 'snappy') {
      this.compression_attribute = 2
    } else if (this.options.compression === 'gzip') {
      this.compression_attribute = 1
    } else {
      this.compression_attribute = 0
    }
    this.client = new KafkaClient(this.options)
    this.producer = new HighLevelProducer(this.client)
  }

  isReady(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.producer.on('ready', () => {
        resolve(true);
      })
      this.producer.on('error', (err) => {
        reject(err);
      })
    })
  }
  log(info: { topic: any; message: any }) {
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        this.emit('logged', info);
      })
      this.producer.send([{
        topic: info.topic,
        messages: info.message,
        attributes: this.compression_attribute
      }], (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  health(callback: (healthStatus: boolean) => void) {
    this.client.topicExists(this.options.topic, (err) => {
      if (err) {
        callback(false)
      } else {
        callback(true)
      }
    })
  }
  
  closeConnection() {
    return this.producer.close()
  }
}

export { KafkaDispatcher }