import app from "../app";
import chai from "chai";
import chaiHttp from "chai-http";
import spies from "chai-spies";
import httpStatus from "http-status";
import { TestDataIngestion } from "./Fixtures";
import { config } from "./Config";
import { routesConfig } from "../configs/RoutesConfig";
import { datasetService, kafkaConnector } from "../routes/Router";

chai.use(spies);
chai.should();
chai.use(chaiHttp);


describe("CREATE API", () => {
    it("successfully arrange connection to kafka", (done) => {
        chai.spy.on(kafkaConnector, "connect", () => {
            return Promise.resolve("kafka connection arranged succesfully")
        })
        kafkaConnector.connect()
        datasetService.init()
        chai.expect(kafkaConnector.connect).to.be.called
        chai.spy.restore(kafkaConnector, "connect")
        done()
    });
    it("it should not ingest data if service is down", (done) => {
        chai.spy.on(kafkaConnector.producer, "send", () => {
            return Promise.reject(new Error("error connecting kafka service"))
        })
        datasetService.init()
        chai
            .request(app)
            .post(config.apiDatasetIngestEndPoint)
            .send(TestDataIngestion.SAMPLE_INPUT)
            .end((err, res) => {
                res.should.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                res.body.responseCode.should.be.eq(httpStatus["500_NAME"]);
                chai.spy.restore(kafkaConnector.producer, "send")
                done();
            });
    });
    it("it should ingest data successfully", (done) => {
        chai.spy.on(kafkaConnector, "execute", () => {
            return Promise.resolve("data ingested")
        })
        chai
            .request(app)
            .post(config.apiDatasetIngestEndPoint)
            .send(TestDataIngestion.SAMPLE_INPUT)
            .end((err, res) => {
                res.should.have.status(httpStatus.OK);
                res.body.should.be.a("object");
                res.body.responseCode.should.be.eq(httpStatus["200_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.data_ingest.api_id);
                chai.spy.restore(kafkaConnector, "execute")
                done();
            });
    });
    it("it should not ingest data when datasetid param is empty", (done) => {
        chai
            .request(app)
            .post("/obsrv/v1/data/ /")
            .send(TestDataIngestion.SAMPLE_INPUT)
            .end((err, res) => {
                res.should.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                res.body.should.be.a("object");
                res.body.responseCode.should.be.eq(httpStatus["500_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.data_ingest.api_id);
                done();
            });
    });
})