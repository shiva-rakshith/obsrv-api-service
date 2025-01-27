import app from "../app";
import chai from "chai";
import chaiHttp from "chai-http";
import spies from "chai-spies";
import httpStatus from "http-status";
import constants from '../resources/Constants.json'
import { TestDatasetTransformation } from "./Fixtures";
import { config } from "./Config";
import { routesConfig } from "../configs/RoutesConfig";
import { dbConnector } from "../routes/Router";
import { DatasetTransformations } from "../helpers/DatasetTransformations";
import { ResponseHandler } from "../helpers/ResponseHandler";

chai.use(spies);
chai.should();
chai.use(chaiHttp);

describe("Dataset Transformation create API", () => {
    it("should insert a record in the database", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.resolve([])
        })
        chai
            .request(app)
            .post(config.apiDatasetTransformationSaveEndPoint)
            .send(TestDatasetTransformation.VALID_SCHEMA)
            .end((err, res) => {
                res.should.have.status(httpStatus.OK);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["200_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.save.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.SUCCESS)
                chai.spy.restore(dbConnector, "execute");
                done();
            });
    });
    it("should throw error", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.resolve([])
        })
        chai.spy.on(ResponseHandler, "successResponse", ()=>{
            throw new Error("Error occured while sending response")
        })
        chai
            .request(app)
            .post(config.apiDatasetTransformationSaveEndPoint)
            .send(TestDatasetTransformation.VALID_SCHEMA)
            .end((err, res) => {
                res.should.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["500_NAME"]);
                res.body.should.have.property("result")
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.save.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                chai.spy.restore(dbConnector, "execute")
                chai.spy.restore(ResponseHandler, "successResponse");
                done();
            });
    });
    it("should not insert record in the database", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.reject(new Error("error occurred while connecting to postgres"))
        })
        chai
            .request(app)
            .post(config.apiDatasetTransformationSaveEndPoint)
            .send(TestDatasetTransformation.VALID_SCHEMA)
            .end((err, res) => {
                res.should.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["500_NAME"]);
                res.body.should.have.property("result")
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.save.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                chai.spy.restore(dbConnector, "execute");
                done();
            });
    });
    it("should not insert record if already exists in the database", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.resolve([{}])
        })
        chai
            .request(app)
            .post(config.apiDatasetTransformationSaveEndPoint)
            .send(TestDatasetTransformation.VALID_SCHEMA)
            .end((err, res) => {
                res.should.have.status(httpStatus.CONFLICT);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["409_NAME"]);
                res.body.should.have.property("result")
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.save.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                chai.spy.restore(dbConnector, "execute");
                done();
            });
    });
    it("should not insert record when request object contains missing fields", (done) => {
        chai
            .request(app)
            .post(config.apiDatasetTransformationSaveEndPoint)
            .send(TestDatasetTransformation.MISSING_REQUIRED_FIELDS_CREATE)
            .end((err, res) => {
                res.should.have.status(httpStatus.BAD_REQUEST);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["400_NAME"]);
                res.body.should.have.property("result")
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.save.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                done();
            });
    })
    it("should not insert record when given invalid schema", (done) => {
        chai
            .request(app)
            .post(config.apiDatasetTransformationSaveEndPoint)
            .send(TestDatasetTransformation.INVALID_SCHEMA)
            .end((err, res) => {
                res.should.have.status(httpStatus.BAD_REQUEST);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["400_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.save.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                done();
            });
    })
})
describe("Dataset Transformation update API", () => {
    it("should successfully update records in database", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.resolve()
        })
        chai
            .request(app)
            .patch(config.apiDatasetTransformationUpdateEndPoint)
            .send(TestDatasetTransformation.VALID_SCHEMA)
            .end((err, res) => {
                res.should.have.status(httpStatus.OK);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["200_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.update.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.SUCCESS)
                chai.spy.restore(dbConnector, "execute")
                done();
            });
    });
    it("should not update records in database", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.reject(new Error("error while connecting to postgres"))
        })
        chai
            .request(app)
            .patch(config.apiDatasetTransformationUpdateEndPoint)
            .send(TestDatasetTransformation.VALID_UPDATE_SCHEMA)
            .end((err, res) => {
                res.should.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["500_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.update.api_id)
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                chai.spy.restore(dbConnector, "execute")
                done();
            });
    });
    it("should not update records when request object does not contain required fields", (done) => {
        chai
            .request(app)
            .patch(config.apiDatasetTransformationUpdateEndPoint)
            .send(TestDatasetTransformation.MISSING_REQUIRED_FIELDS_UPDATE)
            .end((err, res) => {
                res.should.have.status(httpStatus.BAD_REQUEST);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["400_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.update.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                done();
            });
    });
})
describe("Dataset Transformation read API", () => {
    it("should successfully retrieve records from database", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.resolve([TestDatasetTransformation.VALID_RECORD])
        })
        chai
            .request(app)
            .get(config.apiDatasetTransformationReadEndPoint.replace(":datasetId", TestDatasetTransformation.SAMPLE_ID).concat('?status = ACTIVE'))
            .end((err, res) => {
                res.should.have.status(httpStatus.OK);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["200_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.read.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.SUCCESS)
                res.body.result.should.be.a("object")
                chai.spy.restore(dbConnector, "execute")
                done();
            })
    }),
        it("should throw error if retrieved record is empty", (done) => {
            chai.spy.on(dbConnector, "execute", () => {
                return Promise.resolve([])
            })
            chai
                .request(app)
                .get(config.apiDatasetTransformationReadEndPoint.replace(":datasetId", TestDatasetTransformation.SAMPLE_ID).concat('?status=DISABLED'))
                .end((err, res) => {
                    res.should.have.status(httpStatus.NOT_FOUND);
                    res.body.should.be.a("object")
                    res.body.responseCode.should.be.eq(httpStatus["404_NAME"]);
                    res.body.should.have.property("result");
                    res.body.id.should.be.eq(routesConfig.config.dataset_transformation.read.api_id);
                    res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                    chai.spy.restore(dbConnector, "execute")
                    done();
                })
        }),
        it("should not retrieve records from database", (done) => {
            chai.spy.on(dbConnector, "execute", () => {
                return Promise.reject(new Error("error while connecting to postgres"))
            })
            chai
                .request(app)
                .get(config.apiDatasetTransformationReadEndPoint.replace(":datasetId", TestDatasetTransformation.SAMPLE_ID).concat('?status=DISABLED'))
                .end((err, res) => {
                    res.should.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                    res.body.should.be.a("object")
                    res.body.responseCode.should.be.eq(httpStatus["500_NAME"]);
                    res.body.should.have.property("result");
                    res.body.id.should.be.eq(routesConfig.config.dataset_transformation.read.api_id);
                    res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                    chai.spy.restore(dbConnector, "execute")
                    done();
                })
        })

})
describe("Dataset Transformation list API", () => {
    it("should successfully list records in the table", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.resolve([{}, {}, {}])
        })
        chai
            .request(app)
            .post(config.apiDatasetTransformationListEndPoint)
            .send(TestDatasetTransformation.VALID_LIST_REQUEST_ACTIVE_STATUS)
            .end((err, res) => {
                res.should.have.status(httpStatus.OK);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["200_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.list.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.SUCCESS)
                res.body.result.should.be.a("array")
                chai.spy.restore(dbConnector, "execute")
                done();
            });
    })
    it("should not list records if request object is invalid", (done) => {
        chai
            .request(app)
            .post(config.apiDatasetTransformationListEndPoint)
            .send({
                "filters": true
            })
            .end((err, res) => {
                res.should.have.status(httpStatus.BAD_REQUEST);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["400_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.list.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                done();
            });
    })
    it("should not list records", (done) => {
        chai.spy.on(dbConnector, "execute", () => {
            return Promise.reject(new Error("error while connecting to postgres"))
        })
        chai
            .request(app)
            .post(config.apiDatasetTransformationListEndPoint)
            .send(TestDatasetTransformation.VALID_LIST_REQUEST_DISABLED_STATUS)
            .end((err, res) => {
                res.should.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                res.body.should.be.a("object")
                res.body.responseCode.should.be.eq(httpStatus["500_NAME"]);
                res.body.should.have.property("result");
                res.body.id.should.be.eq(routesConfig.config.dataset_transformation.list.api_id);
                res.body.params.status.should.be.eq(constants.STATUS.FAILURE)
                chai.spy.restore(dbConnector, "execute")
                done();
            })
    })


})