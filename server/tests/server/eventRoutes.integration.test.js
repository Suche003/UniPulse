import { describe, it, before, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import express from "express";
import request from "supertest";
import eventRouter from "../../routes/eventRoutes.js";
import Event from "../../models/Event.js";
import Counter from "../../models/Counter.js";

describe("Event Routes Integration Tests", () => {
  let app;
  let findOneAndUpdateStub, findStub, findByIdAndDeleteStub, findByIdStub, findByIdAndUpdateStub;

  before(() => {
    app = express();
    app.use(express.json());
    app.use("/events", eventRouter);
  });

  beforeEach(() => {
    findOneAndUpdateStub = sinon.stub(Counter, "findOneAndUpdate");
    findStub = sinon.stub(Event, "find");
    findByIdAndDeleteStub = sinon.stub(Event, "findByIdAndDelete");
    findByIdStub = sinon.stub(Event, "findById");
    findByIdAndUpdateStub = sinon.stub(Event, "findByIdAndUpdate");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("POST /events", () => {
    it("should create a new event", async () => {
      const mockCounter = { seq: 1 };
      findOneAndUpdateStub.resolves(mockCounter);

      sinon.stub(Event.prototype, "save").resolves({
        _id: "507f191e810c19729de860ea",
        eventid: "Evt001",
        clubid: "club123",
        title: "Tech Summit",
        description: "A tech conference",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: "Convention Center",
        ispaid: false,
        ticketPrice: 0,
        pdf: "event.pdf",
        image: null,
        status: "pending",
      });

      const response = await request(app)
        .post("/events")
        .field("clubid", "club123")
        .field("title", "Tech Summit")
        .field("description", "A tech conference")
        .field("date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .field("location", "Convention Center")
        .field("ispaid", "false");

      expect(response.status).to.equal(201);
      expect(response.body.eventid).to.equal("Evt001");
    });

    it("should reject event creation without PDF", async () => {
      const response = await request(app)
        .post("/events")
        .field("clubid", "club123")
        .field("title", "Tech Summit")
        .field("description", "A tech conference")
        .field("date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .field("location", "Convention Center")
        .field("ispaid", "false");

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("PDF is required");
    });
  });

  describe("GET /events/all", () => {
    it("should retrieve all events sorted by date", async () => {
      const mockEvents = [
        {
          _id: "1",
          eventid: "Evt001",
          title: "Event 1",
          date: new Date("2024-05-01"),
          status: "approved",
        },
        {
          _id: "2",
          eventid: "Evt002",
          title: "Event 2",
          date: new Date("2024-05-15"),
          status: "approved",
        },
      ];

      findStub.returns({
        sort: sinon.stub().resolves(mockEvents),
      });

      const response = await request(app).get("/events/all");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(2);
    });

    it("should return empty array when no events exist", async () => {
      findStub.returns({
        sort: sinon.stub().resolves([]),
      });

      const response = await request(app).get("/events/all");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(0);
    });
  });

  describe("GET /events", () => {
    it("should retrieve approved events", async () => {
      const mockEvents = [
        {
          _id: "1",
          eventid: "Evt001",
          title: "Event 1",
          status: "approved",
        },
        {
          _id: "2",
          eventid: "Evt002",
          title: "Event 2",
          status: "approved",
        },
      ];

      findStub.returns({
        sort: sinon.stub().resolves(mockEvents),
      });

      const response = await request(app).get("/events");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(2);
    });

    it("should not include pending or rejected events", async () => {
      findStub.returns({
        sort: sinon.stub().resolves([]),
      });

      const response = await request(app).get("/events");

      expect(response.status).to.equal(200);
      const callArgs = findStub.getCall(0).args[0];
      expect(callArgs.status).to.equal("approved");
    });
  });

  describe("GET /events/club/:clubid", () => {
    it("should retrieve events for a specific club", async () => {
      const mockEvents = [
        {
          _id: "1",
          eventid: "Evt001",
          title: "Event 1",
          clubid: "club123",
        },
        {
          _id: "2",
          eventid: "Evt002",
          title: "Event 2",
          clubid: "club123",
        },
      ];

      findStub.returns({
        sort: sinon.stub().resolves(mockEvents),
      });

      const response = await request(app).get("/events/club/club123");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(2);
    });

    it("should return empty array when club has no events", async () => {
      findStub.returns({
        sort: sinon.stub().resolves([]),
      });

      const response = await request(app).get("/events/club/club999");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(0);
    });
  });

  describe("GET /events/pending", () => {
    it("should retrieve pending events", async () => {
      const mockEvents = [
        {
          _id: "1",
          eventid: "Evt001",
          title: "Event 1",
          status: "pending",
        },
        {
          _id: "2",
          eventid: "Evt002",
          title: "Event 2",
          status: "pending",
        },
      ];

      findStub.returns({
        sort: sinon.stub().resolves(mockEvents),
      });

      const response = await request(app).get("/events/pending");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(2);
    });
  });

  describe("GET /events/:id", () => {
    it("should retrieve a specific event by ID", async () => {
      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        eventid: "Evt001",
        title: "Tech Summit",
        description: "A tech conference",
        status: "approved",
      };

      findByIdStub.resolves(mockEvent);

      const response = await request(app).get("/events/507f191e810c19729de860ea");

      expect(response.status).to.equal(200);
      expect(response.body.data._id).to.equal("507f191e810c19729de860ea");
      expect(response.body.data.title).to.equal("Tech Summit");
    });

    it("should return 404 when event not found", async () => {
      findByIdStub.resolves(null);

      const response = await request(app).get("/events/507f191e810c19729de860ea");

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Event not found");
    });
  });

  describe("DELETE /events/:id", () => {
    it("should delete an event successfully", async () => {
      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        eventid: "Evt001",
        title: "Event to delete",
      };

      findByIdAndDeleteStub.resolves(mockEvent);

      const response = await request(app).delete("/events/507f191e810c19729de860ea");

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Event deleted successfully");
    });

    it("should return 404 when event not found", async () => {
      findByIdAndDeleteStub.resolves(null);

      const response = await request(app).delete("/events/507f191e810c19729de860ea");

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Event not found");
    });
  });

  describe("PUT /events/approve/:id", () => {
    it("should approve an event", async () => {
      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        eventid: "Evt001",
        title: "Event",
        status: "approved",
      };

      findByIdAndUpdateStub.resolves(mockEvent);

      const response = await request(app).put("/events/approve/507f191e810c19729de860ea");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("approved");
    });

    it("should return 404 when event not found", async () => {
      findByIdAndUpdateStub.resolves(null);

      const response = await request(app).put("/events/approve/507f191e810c19729de860ea");

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Event not found");
    });
  });

  describe("PUT /events/reject/:id", () => {
    it("should reject an event with reason", async () => {
      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        eventid: "Evt001",
        title: "Event",
        status: "rejected",
        rejectReason: "Inappropriate content",
      };

      findByIdAndUpdateStub.resolves(mockEvent);

      const response = await request(app)
        .put("/events/reject/507f191e810c19729de860ea")
        .send({ reason: "Inappropriate content" });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("rejected");
      expect(response.body.rejectReason).to.equal("Inappropriate content");
    });

    it("should return 400 when reject reason is missing", async () => {
      const response = await request(app)
        .put("/events/reject/507f191e810c19729de860ea")
        .send({});

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Reject reason is required");
    });

    it("should return 404 when event not found", async () => {
      findByIdAndUpdateStub.resolves(null);

      const response = await request(app)
        .put("/events/reject/507f191e810c19729de860ea")
        .send({ reason: "Inappropriate content" });

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Event not found");
    });
  });

  describe("PUT /events/update/:id", () => {
    it("should update an event successfully", async () => {
      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        title: "Original Title",
        description: "Original",
        date: new Date(),
        location: "Original Location",
        ispaid: false,
        ticketPrice: 0,
        pdf: "event.pdf",
        image: null,
        save: sinon.stub().resolves({
          _id: "507f191e810c19729de860ea",
          title: "Updated Title",
          description: "Updated description",
          date: new Date(),
          location: "New Location",
        }),
      };

      findByIdStub.resolves(mockEvent);

      const response = await request(app)
        .put("/events/update/507f191e810c19729de860ea")
        .send({
          title: "Updated Title",
          description: "Updated description",
          location: "New Location",
        });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Event updated successfully");
      expect(response.body.data.title).to.equal("Updated Title");
    });

    it("should return 404 when event not found", async () => {
      findByIdStub.resolves(null);

      const response = await request(app)
        .put("/events/update/507f191e810c19729de860ea")
        .send({ title: "New Title" });

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Event not found");
    });
  });
});
