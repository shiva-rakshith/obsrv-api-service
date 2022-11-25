import app from "../app";
import chai from "chai";
import chaiHttp from "chai-http";
import TestDruidQuery from "./testquery";
chai.should();
chai.use(chaiHttp);

describe("druid API", () => {
  describe("GET /", () => {
    it("it should return process information", (done) => {
      chai
        .request(app)
        .get("/status")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.result.should.be.a("object");
          res.body.id.should.be.eq("druid.status");
          res.body.responseCode.should.be.eq("OK");
          done();
        });
    });
    it("it should return true as response for health check", (done) => {
      chai
        .request(app)
        .get("/status/health")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.result.should.be.a("boolean");
          res.body.id.should.be.eq("druid.health.check");
          res.body.responseCode.should.be.eq("OK");
          done();
        });
    });
    it("it should reject the query because of incorrect url", (done) => {
      chai
        .request(app)
        .get("/invalid/endpoint")
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a("object");
          res.body.id.should.be.eq("druid.api");
          res.body.responseCode.should.be.eq("failed");
          res.body.params.status.should.be.eq("failed");
          res.body.result.should.be.empty;
          done();
        });
    });
  });

  describe("POST /", () => {
    it("it should fetch information from druid data source", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.VALID_QUERY))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("OK");
          res.body.should.have.property("result");
          res.body.result.length.should.be.lessThan(101);
          res.body.id.should.be.eq("druid.execute.native.query");
          done();
        });
    });
    it("it should reject query, when datarange given as list is higher than limit", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.HIGH_DATE_RANGE_GIVEN_AS_LIST))
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("failed");
          res.body.params.status.should.be.eq("failed");
          res.body.result.should.be.empty;
          res.body.id.should.be.eq("druid.execute.native.query");
          done();
        });
    });
    it("it should reject query, when datarange given as string is higher than limit", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.HIGH_DATE_RANGE_GIVEN_AS_STRING))
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("failed");
          res.body.params.status.should.be.eq("failed");
          res.body.result.should.be.empty;
          res.body.id.should.be.eq("druid.execute.native.query");
          done();
        });
    });
    it("it should set threshold to default when given threshold is higher than limit", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.HIGH_THRESHOLD_QUERY)) // given threshold is 1K  
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("OK");
          res.body.result.length.should.be.lessThan(101); // default is 100
          res.body.id.should.be.eq("druid.execute.native.query");
          done();
        });
    });
    it("it should set row_limit to default when given row_limit is higher than limit", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.HIGH_LIMIT_QUERY)) // given row_limit is 1K
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("OK");
          res.body.result.length.should.be.lessThan(101); // default is 100
          res.body.id.should.be.eq("druid.execute.native.query");
          done();
        });
    });
    it("it should set threshold to default when threshold is not given", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.WITHOUT_THRESOLD_QUERY))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("OK");
          res.body.result.length.should.be.lessThan(101); // default is 100
          res.body.id.should.be.eq("druid.execute.native.query");
          done();
        });
    });
    it("it should reject query when date range is not given", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.WITHOUT_DATE_RANGE_QUERY))
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("failed");
          res.body.params.status.should.be.eq("failed");
          res.body.result.should.be.empty;
          res.body.id.should.be.eq("druid.execute.native.query");
          done();
        });
    });
    // todo
    it("it should reject query when query limits are not found for particular datasource", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.UNSUPPORTED_DATA_SOURCE))
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("failed");
          res.body.params.status.should.be.eq("failed");
          res.body.result.should.be.empty;
          res.body.id.should.be.eq("druid.execute.native.query");
          done();
        });
    });
    it("it should reject query when querytype is invalid", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.INVALID_QUERY_TYPE))
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("failed");
          res.body.params.status.should.be.eq("failed");
          res.body.result.should.be.empty;
          res.body.id.should.be.eq("druid.execute.native.query");
          done();
        });
    });
    it("it should allow druid to query when a valid sql query is given", (done) => {
      chai
        .request(app)
        .post("/druid/v2/sql/")
        .send(JSON.parse(TestDruidQuery.VALID_SQL_QUERY))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("OK");
          res.body.result.length.should.be.lessThan(101);
          res.body.id.should.be.eq("druid.execute.sql.query");
          done();
        });
    });
    it("it should update row_limit to default when row_limit is higher than limit", (done) => {
      chai
        .request(app)
        .post("/druid/v2/sql/")
        .send(JSON.parse(TestDruidQuery.HIGH_LIMIT_SQL_QUERY)) // given row_limit is 1K
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("OK");
          res.body.result.length.should.be.lessThan(101); // default is 100
          res.body.id.should.be.eq("druid.execute.sql.query");
          done();
        });
    });
    it("it should set row_limit to default when none is given", (done) => {
      chai
        .request(app)
        .post("/druid/v2/sql/")
        .send(JSON.parse(TestDruidQuery.WITHOUT_LIMIT_SQL_QUERY))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("OK");
          res.body.result.length.should.be.lessThan(101); // default is 100
          res.body.id.should.be.eq("druid.execute.sql.query");
          done();
        });
    });
    it("it should reject the query when daterange range is higher than limit", (done) => {
      chai
        .request(app)
        .post("/druid/v2/sql/")
        .send(JSON.parse(TestDruidQuery.HIGH_DATE_RANGE_SQL_QUERY))
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("failed");
          res.body.params.status.should.be.eq("failed");
          res.body.result.should.be.empty;
          res.body.id.should.be.eq("druid.execute.sql.query");
          done();
        });
    });
    it("it should reject the query when no daterange is given", (done) => {
      chai
        .request(app)
        .post("/druid/v2/sql/")
        .send(JSON.parse(TestDruidQuery.WITHOUT_DATE_RANGE_SQL_QUERY))
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("failed");
          res.body.params.status.should.be.eq("failed");
          res.body.result.should.be.empty;
          res.body.id.should.be.eq("druid.execute.sql.query");
          done();
        });
    });
    it("it should reject query when invalid datasource is given", (done) => {
      chai
        .request(app)
        .post("/druid/v2/sql/")
        .send(JSON.parse(TestDruidQuery.UNSUPPORTED_DATASOURCE_SQL_QUERY))
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.responseCode.should.be.eq("failed");
          res.body.params.status.should.be.eq("failed");
          res.body.result.should.be.empty;
          res.body.id.should.be.eq("druid.execute.sql.query");
          done();
        });
    });
  });
});
