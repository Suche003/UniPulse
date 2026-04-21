import { describe, it, before, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import express from "express";
import request from "supertest";
import stallRouter from "../../routes/stallRoutes.js";
import Stall from "../../models/Stall.js";
import Event from "../../models/Event.js";

describe("Stall Routes Integration Tests", () => {
  let app;
  let stallFindStub, stallFindOneStub, stallFindOneAndUpdateStub, stallFindOneAndDeleteStub;
  let eventFindOneStub;

  before(() => {
    app = express();
    app.use(express.json());
    app.use("/stalls", stallRouter);
  });

  beforeEach(() => {
    stallFindStub = sinon.stub(Stall, "find");
    stallFindOneStub = sinon.stub(Stall, "findOne");
    stallFindOneAndUpdateStub = sinon.stub(Stall, "findOneAndUpdate");
    stallFindOneAndDeleteStub = sinon.stub(Stall, "findOneAndDelete");
    eventFindOneStub = sinon.stub(Event, "findOne");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("POST /stalls/event/:eventid", () => {
    it("should create a new stall for an event", async () => {
      const mockEvent = { _id: "507f191e810c19729de860ea", eventid: "Evt001" };
      eventFindOneStub.resolves(mockEvent);

      sinon.stub(Stall.prototype, "save").resolves({
        _id: "507f191e810c19729de860eb",
        eventid: "Evt001",
        stallId: "STALL001",
        category: "Food",
        price: 5000,
        location: "A1",
        availableStalls: 10,
        image: "stall.jpg",
        description: "Food stall",
        status: "Available",
      });

      const response = await request(app)
        .post("/stalls/event/Evt001")
        .send({
          stallId: "STALL001",
          category: "Food",
          price: 5000,
          location: "A1",
          availableStalls: 10,
          image: "stall.jpg",
          description: "Food stall",
        });

      expect(response.status).to.equal(201);
      expect(response.body.stallId).to.equal("STALL001");
      expect(response.body.category).to.equal("Food");
    });

    it("should return 404 if event does not exist", async () => {
      eventFindOneStub.resolves(null);

      const response = await request(app)
        .post("/stalls/event/Evt999")
        .send({
          stallId: "STALL001",
          category: "Food",
          price: 5000,
          location: "A1",
          availableStalls: 10,
        });

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Event not found.");
    });

    it("should reject duplicate stallId", async () => {
      const mockEvent = { _id: "507f191e810c19729de860ea", eventid: "Evt001" };
      eventFindOneStub.resolves(mockEvent);

      const error = new Error("E11000 duplicate key error");
      error.code = 11000;
      sinon.stub(Stall.prototype, "save").rejects(error);

      const response = await request(app)
        .post("/stalls/event/Evt001")
        .send({
          stallId: "STALL001",
          category: "Food",
          price: 5000,
          location: "A1",
          availableStalls: 10,
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Stall ID must be unique.");
    });
  });

  describe("GET /stalls", () => {
    it("should retrieve all stalls across all events", async () => {
      const mockStalls = [
        {
          _id: "1",
          eventid: "Evt001",
          stallId: "STALL001",
          category: "Food",
          price: 5000,
        },
        {
          _id: "2",
          eventid: "Evt002",
          stallId: "STALL002",
          category: "Beverages",
          price: 3000,
        },
      ];

      stallFindStub.returns({
        sort: sinon.stub().resolves(mockStalls),
      });

      const response = await request(app).get("/stalls");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(2);
    });

    it("should return empty array when no stalls exist", async () => {
      stallFindStub.returns({
        sort: sinon.stub().resolves([]),
      });

      const response = await request(app).get("/stalls");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(0);
    });
  });

  describe("GET /stalls/event/:eventid", () => {
    it("should retrieve all stalls for a specific event", async () => {
      const mockStalls = [
        {
          _id: "1",
          eventid: "Evt001",
          stallId: "STALL001",
          category: "Food",
          price: 5000,
        },
        {
          _id: "2",
          eventid: "Evt001",
          stallId: "STALL002",
          category: "Beverages",
          price: 3000,
        },
      ];

      stallFindStub.returns({
        sort: sinon.stub().resolves(mockStalls),
      });

      const response = await request(app).get("/stalls/event/Evt001");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(2);
    });

    it("should return empty array when event has no stalls", async () => {
      stallFindStub.returns({
        sort: sinon.stub().resolves([]),
      });

      const response = await request(app).get("/stalls/event/Evt999");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(0);
    });
  });

  describe("GET /stalls/event/:eventid/:id", () => {
    it("should retrieve a specific stall by ID", async () => {
      const mockStall = {
        _id: "507f191e810c19729de860eb",
        eventid: "Evt001",
        stallId: "STALL001",
        category: "Food",
        price: 5000,
        location: "A1",
        availableStalls: 10,
        status: "Available",
      };

      stallFindOneStub.resolves(mockStall);

      const response = await request(app).get("/stalls/event/Evt001/STALL001");

      expect(response.status).to.equal(200);
      expect(response.body.stallId).to.equal("STALL001");
      expect(response.body.eventid).to.equal("Evt001");
    });

    it("should return 404 when stall not found", async () => {
      stallFindOneStub.resolves(null);

      const response = await request(app).get("/stalls/event/Evt001/STALL999");

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Stall not found.");
    });
  });

  describe("PUT /stalls/event/:eventid/:id", () => {
    it("should update a stall successfully", async () => {
      const mockStall = {
        _id: "507f191e810c19729de860eb",
        eventid: "Evt001",
        stallId: "STALL001",
        category: "Food & Beverages",
        price: 6000,
        location: "A2",
        availableStalls: 8,
        description: "Updated stall",
        status: "Pending",
      };

      stallFindOneAndUpdateStub.resolves(mockStall);

      const response = await request(app)
        .put("/stalls/event/Evt001/STALL001")
        .send({
          category: "Food & Beverages",
          price: 6000,
          location: "A2",
          availableStalls: 8,
          description: "Updated stall",
          status: "Pending",
        });

      expect(response.status).to.equal(200);
      expect(response.body.category).to.equal("Food & Beverages");
      expect(response.body.price).to.equal(6000);
      expect(response.body.status).to.equal("Pending");
    });

    it("should update stall image when provided", async () => {
      const mockStall = {
        _id: "507f191e810c19729de860eb",
        eventid: "Evt001",
        stallId: "STALL001",
        category: "Food",
        price: 5000,
        image: "new-stall.jpg",
      };

      stallFindOneAndUpdateStub.resolves(mockStall);

      const response = await request(app)
        .put("/stalls/event/Evt001/STALL001")
        .send({
          category: "Food",
          price: 5000,
          image: "new-stall.jpg",
        });

      expect(response.status).to.equal(200);
      expect(response.body.image).to.equal("new-stall.jpg");
    });

    it("should return 404 when stall not found", async () => {
      stallFindOneAndUpdateStub.resolves(null);

      const response = await request(app)
        .put("/stalls/event/Evt001/STALL999")
        .send({ category: "Food", price: 5000 });

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Stall not found.");
    });

    it("should allow status update to different values", async () => {
      const mockStall = {
        _id: "507f191e810c19729de860eb",
        eventid: "Evt001",
        stallId: "STALL001",
        status: "Booked",
      };

      stallFindOneAndUpdateStub.resolves(mockStall);

      const response = await request(app)
        .put("/stalls/event/Evt001/STALL001")
        .send({ status: "Booked" });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("Booked");
    });
  });

  describe("DELETE /stalls/event/:eventid/:id", () => {
    it("should delete a stall successfully", async () => {
      const mockStall = {
        _id: "507f191e810c19729de860eb",
        eventid: "Evt001",
        stallId: "STALL001",
      };

      stallFindOneAndDeleteStub.resolves(mockStall);

      const response = await request(app).delete("/stalls/event/Evt001/STALL001");

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Stall deleted successfully.");
    });

    it("should return 404 when stall not found", async () => {
      stallFindOneAndDeleteStub.resolves(null);

      const response = await request(app).delete("/stalls/event/Evt001/STALL999");

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Stall not found.");
    });
  });
});
