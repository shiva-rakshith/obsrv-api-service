import { KafkaClient, HighLevelProducer, KafkaClientOptions } from 'kafka-node'
import TransportStream from 'winston-transport'
import _, { reject } from 'lodash'

interface KafkaDispatcherOptions extends TransportStream.TransportStreamOptions {
  kafkaBrokers: string[]
  compression?: 'none' | 'gzip' | 'snappy'
}

interface CustomKafkaClientOptions extends KafkaClientOptions {
  topic: any
  compression: string
}

class KafkaDispatcher extends TransportStream {
  private options: any
  private compression_attribute: number
  private client: any
  public producer!: HighLevelProducer
 
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
     // Listen to the ready event on the producer to know when it is ready to send messages
     
     this.producer.on('error', (err) => {
      console.log(err, "error")
      throw new Error(err)
    })
    this.producer.on('ready', () => {
      console.log("connected succesfully")
    })
    
  }

   
  log(info: { topic: any; message: any }) {
       setImmediate(() => {
        this.emit('logged', info);
      })
      this.producer.send([{
        topic: info.topic || 'local.ingest',
        messages: info.message,
        attributes: this.compression_attribute
      }], (err, data) => {
        if (err) {
          throw new Error("error occured while sending data to kafka")
        } else {
          return
        }
      })
  }


  health(callback: (healthStatus: boolean) => void) {
    this.client.topicExists(this.options.topic, (err: any) => {
      if (err) {
        callback(false)
      } else {
        callback(true)
      }
    })
  }
}

export { KafkaDispatcher }
