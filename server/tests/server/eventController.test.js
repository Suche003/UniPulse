import { describe, it, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import * as eventController from "../../controllers/eventController.js";
import Event from "../../models/Event.js";
import Counter from "../../models/Counter.js";

describe("Event Controller", () => {
  let req, res, next;
  let findOneAndUpdateStub, findStub, findByIdAndDeleteStub, findByIdStub;
  let eventSaveStub, eventConstructorStub;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      files: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();

    findOneAndUpdateStub = sinon.stub(Counter, "findOneAndUpdate");
    findStub = sinon.stub(Event, "find");
    findByIdAndDeleteStub = sinon.stub(Event, "findByIdAndDelete");
    findByIdStub = sinon.stub(Event, "findById");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createEvent", () => {
    it("should create a new event with auto-incremented ID", async () => {
      req.body = {
        clubid: "club123",
        title: "Tech Summit 2024",
        description: "A gathering of tech enthusiasts",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: "University Hall",
        ispaid: false,
        ticketPrice: 0,
      };

      req.files = {
        pdf: [{ filename: "event.pdf" }],
        image: [{ filename: "event.jpg" }],
      };

      const mockCounter = { seq: 1 };
      findOneAndUpdateStub.resolves(mockCounter);

      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        eventid: "Evt001",
        clubid: "club123",
        title: "Tech Summit 2024",
        description: "A gathering of tech enthusiasts",
        date: req.body.date,
        location: "University Hall",
        ispaid: false,
        ticketPrice: 0,
        pdf: "event.pdf",
        image: "event.jpg",
        status: "pending",
      };

      sinon.stub(Event.prototype, "save").resolves(mockEvent);

      await eventController.createEvent(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.eventid).to.equal("Evt001");
      expect(responseData.title).to.equal("Tech Summit 2024");
    });

    it("should create paid event with ticket price", async () => {
      req.body = {
        clubid: "club123",
        title: "Premium Concert",
        description: "Exclusive concert event",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: "Concert Hall",
        ispaid: "true",
        ticketPrice: 500,
      };

      req.files = {
        pdf: [{ filename: "event.pdf" }],
      };

      const mockCounter = { seq: 2 };
      findOneAndUpdateStub.resolves(mockCounter);

      const mockEvent = {
        _id: "507f191e810c19729de860eb",
        eventid: "Evt002",
        clubid: "club123",
        title: "Premium Concert",
        ispaid: true,
        ticketPrice: 500,
        pdf: "event.pdf",
        status: "pending",
      };

      sinon.stub(Event.prototype, "save").resolves(mockEvent);

      await eventController.createEvent(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.ispaid).to.be.true;
      expect(responseData.ticketPrice).to.equal(500);
    });

    it("should handle database errors gracefully", async () => {
      req.body = {
        clubid: "club123",
        title: "Tech Summit 2024",
        description: "A gathering of tech enthusiasts",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: "University Hall",
        ispaid: false,
      };

      req.files = {
        pdf: [{ filename: "event.pdf" }],
      };

      findOneAndUpdateStub.rejects(new Error("Database error"));

      await eventController.createEvent(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database error");
    });
  });

  describe("getAllEvents", () => {
    it("should return all events sorted by date", async () => {
      const mockEvents = [
        { _id: "1", title: "Event 1", date: new Date("2024-05-01") },
        { _id: "2", title: "Event 2", date: new Date("2024-05-15") },
      ];

      findStub.returns({
        sort: sinon.stub().resolves(mockEvents),
      });

      await eventController.getAllEvents(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(2);
    });

    it("should handle errors gracefully", async () => {
      findStub.returns({
        sort: sinon.stub().rejects(new Error("Database error")),
      });

      await eventController.getAllEvents(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Server error");
    });
  });

  describe("getEvents (approved events)", () => {
    it("should return approved events", async () => {
      const mockEvents = [
        { _id: "1", title: "Event 1", status: "approved" },
        { _id: "2", title: "Event 2", status: "approved" },
      ];

      findStub.returns({
        sort: sinon.stub().resolves(mockEvents),
      });

      await eventController.getEvents(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(2);
    });

    it("should handle errors gracefully", async () => {
      findStub.returns({
        sort: sinon.stub().rejects(new Error("Database error")),
      });

      await eventController.getEvents(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database error");
    });
  });

  describe("getMyClubEvents", () => {
    it("should return events for a specific club", async () => {
      req.params.clubid = "club123";

      const mockEvents = [
        { _id: "1", title: "Event 1", clubid: "club123" },
        { _id: "2", title: "Event 2", clubid: "club123" },
      ];

      findStub.returns({
        sort: sinon.stub().resolves(mockEvents),
      });

      await eventController.getMyClubEvents(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(2);
    });

    it("should return empty array when club has no events", async () => {
      req.params.clubid = "club123";

      findStub.returns({
        sort: sinon.stub().resolves([]),
      });

      await eventController.getMyClubEvents(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(0);
    });

    it("should handle errors gracefully", async () => {
      req.params.clubid = "club123";

      findStub.returns({
        sort: sinon.stub().rejects(new Error("Database error")),
      });

      await eventController.getMyClubEvents(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Server error");
    });
  });

  describe("deleteEvent", () => {
    it("should successfully delete an event", async () => {
      req.params.id = "507f191e810c19729de860ea";

      const mockEvent = { _id: "507f191e810c19729de860ea", title: "Event to delete" };
      findByIdAndDeleteStub.resolves(mockEvent);

      await eventController.deleteEvent(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Event deleted successfully");
    });

    it("should return 404 when event not found", async () => {
      req.params.id = "507f191e810c19729de860ea";

      findByIdAndDeleteStub.resolves(null);

      await eventController.deleteEvent(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Event not found");
    });

    it("should handle database errors gracefully", async () => {
      req.params.id = "507f191e810c19729de860ea";

      findByIdAndDeleteStub.rejects(new Error("Database error"));

      await eventController.deleteEvent(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Server error");
    });
  });

  describe("getPendingEvents", () => {
    it("should return pending events sorted by creation date", async () => {
      const mockEvents = [
        { _id: "1", title: "Event 1", status: "pending" },
        { _id: "2", title: "Event 2", status: "pending" },
      ];

      findStub.returns({
        sort: sinon.stub().resolves(mockEvents),
      });

      await eventController.getPendingEvents(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(2);
    });

    it("should return empty array when no pending events", async () => {
      findStub.returns({
        sort: sinon.stub().resolves([]),
      });

      await eventController.getPendingEvents(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(0);
    });
  });

  describe("approveEvent", () => {
    it("should approve an event", async () => {
      req.params.id = "507f191e810c19729de860ea";

      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        title: "Event",
        status: "approved",
      };

      sinon.stub(Event, "findByIdAndUpdate").resolves(mockEvent);

      await eventController.approveEvent(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.status).to.equal("approved");
    });

    it("should return 404 when event not found", async () => {
      req.params.id = "507f191e810c19729de860ea";

      sinon.stub(Event, "findByIdAndUpdate").resolves(null);

      await eventController.approveEvent(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Event not found");
    });
  });

  describe("rejectEvent", () => {
    it("should reject an event with reason", async () => {
      req.params.id = "507f191e810c19729de860ea";
      req.body = { reason: "Inappropriate content" };

      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        title: "Event",
        status: "rejected",
        rejectReason: "Inappropriate content",
      };

      sinon.stub(Event, "findByIdAndUpdate").resolves(mockEvent);

      await eventController.rejectEvent(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.status).to.equal("rejected");
      expect(responseData.rejectReason).to.equal("Inappropriate content");
    });

    it("should return 400 when reject reason is missing", async () => {
      req.params.id = "507f191e810c19729de860ea";
      req.body = {};

      await eventController.rejectEvent(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Reject reason is required");
    });

    it("should return 404 when event not found", async () => {
      req.params.id = "507f191e810c19729de860ea";
      req.body = { reason: "Inappropriate content" };

      sinon.stub(Event, "findByIdAndUpdate").resolves(null);

      await eventController.rejectEvent(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Event not found");
    });
  });

  describe("getEventById", () => {
    it("should return a single event by ID", async () => {
      req.params.id = "507f191e810c19729de860ea";

      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        title: "Tech Summit",
        description: "A gathering",
        status: "approved",
      };

      findByIdStub.resolves(mockEvent);

      await eventController.getEventById(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.data._id).to.equal("507f191e810c19729de860ea");
      expect(responseData.data.title).to.equal("Tech Summit");
    });

    it("should return 404 when event not found", async () => {
      req.params.id = "507f191e810c19729de860ea";

      findByIdStub.resolves(null);

      await eventController.getEventById(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Event not found");
    });

    it("should handle database errors gracefully", async () => {
      req.params.id = "507f191e810c19729de860ea";

      findByIdStub.rejects(new Error("Database error"));

      await eventController.getEventById(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database error");
    });
  });

  describe("updateEvent", () => {
    it("should update an event with new data", async () => {
      req.params.id = "507f191e810c19729de860ea";
      req.body = {
        title: "Updated Title",
        description: "Updated description",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: "New Location",
      };

      req.files = {};

      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        title: "Original Title",
        description: "Original description",
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
          date: req.body.date,
          location: "New Location",
        }),
      };

      findByIdStub.resolves(mockEvent);

      await eventController.updateEvent(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Event updated successfully");
      expect(responseData.data.title).to.equal("Updated Title");
    });

    it("should update PDF file when provided", async () => {
      req.params.id = "507f191e810c19729de860ea";
      req.body = { title: "Event Title" };
      req.files = {
        pdf: [{ filename: "new-event.pdf" }],
      };

      const mockEvent = {
        _id: "507f191e810c19729de860ea",
        title: "Event Title",
        pdf: "old.pdf",
        save: sinon.stub().resolves({
          _id: "507f191e810c19729de860ea",
          title: "Event Title",
          pdf: "new-event.pdf",
        }),
      };

      findByIdStub.resolves(mockEvent);

      await eventController.updateEvent(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(mockEvent.pdf).to.equal("new-event.pdf");
    });

    it("should return 404 when event not found", async () => {
      req.params.id = "507f191e810c19729de860ea";
      req.body = { title: "New Title" };
      req.files = {};

      findByIdStub.resolves(null);

      await eventController.updateEvent(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Event not found");
    });

    it("should handle database errors gracefully", async () => {
      req.params.id = "507f191e810c19729de860ea";
      req.body = { title: "New Title" };
      req.files = {};

      findByIdStub.rejects(new Error("Database error"));

      await eventController.updateEvent(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database error");
    });
  });
});