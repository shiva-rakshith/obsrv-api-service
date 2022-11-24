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
          done();
        });
    });
    it("it should fetch all datasource(s) available", (done) => {
      chai
        .request(app)
        .get("/druid/v2/datasources")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          done();
        });
    });
    it("it should reject the query because of incorrect url", (done) => {
      chai
        .request(app)
        .get("/invalid/endpoint")
        .end((err, res) => {
          res.should.have.status(404);
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
          done();
        });
    });
    it("it should set threshold to default when given threshold is higher than limit", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.HIGH_THRESHOLD_QUERY))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          done();
        });
    });
    it("it should set row_limit to default when given row_limit is higher than limit", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.HIGH_LIMIT_QUERY))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
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
          done();
        });
    });
    it("it should allow druid to query when limits are not found for particular datasource", (done) => {
      chai
        .request(app)
        .post("/druid/v2/")
        .send(JSON.parse(TestDruidQuery.UNSUPPORTED_DATA_SOURCE))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
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
          done();
        });
    });
    it("it should update row_limit to default when row_limit is higher than limit", (done) => {
      chai
        .request(app)
        .post("/druid/v2/sql/")
        .send(JSON.parse(TestDruidQuery.HIGH_LIMIT_SQL_QUERY))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
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
          done();
        });
    });
    it("it should reject query when invalid datasource is given", (done) => {
      chai
        .request(app)
        .post("/druid/v2/sql/")
        .send(JSON.parse(TestDruidQuery.UNSUPPORTED_DATASOURCE_SQL_QUERY))
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.be.a("object");
          done();
        });
    });
  });
});
