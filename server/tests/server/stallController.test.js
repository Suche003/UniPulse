import { describe, it, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import * as stallController from "../../controllers/stallController.js";
import Stall from "../../models/Stall.js";
import Event from "../../models/Event.js";

describe("Stall Controller", () => {
  let req, res, next;
  let stallFindStub, stallFindOneStub, stallFindOneAndUpdateStub, stallFindOneAndDeleteStub;
  let stallSaveStub, eventFindOneStub;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();

    stallFindStub = sinon.stub(Stall, "find");
    stallFindOneStub = sinon.stub(Stall, "findOne");
    stallFindOneAndUpdateStub = sinon.stub(Stall, "findOneAndUpdate");
    stallFindOneAndDeleteStub = sinon.stub(Stall, "findOneAndDelete");
    eventFindOneStub = sinon.stub(Event, "findOne");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createStall", () => {
    it("should create a new stall for an event", async () => {
      req.params = { eventid: "Evt001" };
      req.body = {
        stallId: "STALL001",
        category: "Food",
        price: 5000,
        location: "A1",
        availableStalls: 10,
        image: "stall.jpg",
        description: "Food stall",
      };

      const mockEvent = { _id: "507f191e810c19729de860ea", eventid: "Evt001" };
      eventFindOneStub.resolves(mockEvent);

      const mockStall = {
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
      };

      sinon.stub(Stall.prototype, "save").resolves(mockStall);

      await stallController.createStall(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.stallId).to.equal("STALL001");
      expect(responseData.category).to.equal("Food");
      expect(responseData.price).to.equal(5000);
    });

    it("should return 404 if event does not exist", async () => {
      req.params = { eventid: "Evt999" };
      req.body = {
        stallId: "STALL001",
        category: "Food",
        price: 5000,
        location: "A1",
        availableStalls: 10,
      };

      eventFindOneStub.resolves(null);

      await stallController.createStall(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Event not found.");
    });

    it("should return 400 for duplicate stallId", async () => {
      req.params = { eventid: "Evt001" };
      req.body = {
        stallId: "STALL001",
        category: "Food",
        price: 5000,
        location: "A1",
        availableStalls: 10,
      };

      const mockEvent = { _id: "507f191e810c19729de860ea", eventid: "Evt001" };
      eventFindOneStub.resolves(mockEvent);

      const error = new Error("E11000 duplicate key error");
      error.code = 11000;
      sinon.stub(Stall.prototype, "save").rejects(error);

      await stallController.createStall(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Stall ID must be unique.");
    });

    it("should return 400 for validation errors", async () => {
      req.params = { eventid: "Evt001" };
      req.body = {
        stallId: "STALL001",
        category: "Food",
        price: -100, // Invalid price
        location: "A1",
      };

      const mockEvent = { _id: "507f191e810c19729de860ea", eventid: "Evt001" };
      eventFindOneStub.resolves(mockEvent);

      const error = new Error("Validation failed");
      error.name = "ValidationError";
      error.errors = {
        price: { message: "Price must be positive" },
      };
      sinon.stub(Stall.prototype, "save").rejects(error);

      await stallController.createStall(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.include("Price must be positive");
    });

    it("should handle database errors gracefully", async () => {
      req.params = { eventid: "Evt001" };
      req.body = {
        stallId: "STALL001",
        category: "Food",
        price: 5000,
        location: "A1",
        availableStalls: 10,
      };

      eventFindOneStub.rejects(new Error("Database connection failed"));

      await stallController.createStall(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database connection failed");
    });
  });

  describe("getStalls", () => {
    it("should return all stalls for a specific event", async () => {
      req.params = { eventid: "Evt001" };

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

      await stallController.getStalls(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(2);
      expect(responseData[0].stallId).to.equal("STALL001");
    });

    it("should return empty array when no stalls exist for event", async () => {
      req.params = { eventid: "Evt001" };

      stallFindStub.returns({
        sort: sinon.stub().resolves([]),
      });

      await stallController.getStalls(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(0);
    });

    it("should handle database errors gracefully", async () => {
      req.params = { eventid: "Evt001" };

      stallFindStub.returns({
        sort: sinon.stub().rejects(new Error("Database error")),
      });

      await stallController.getStalls(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database error");
    });
  });

  describe("getStallById", () => {
    it("should return a single stall by ID and event ID", async () => {
      req.params = { eventid: "Evt001", id: "STALL001" };

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

      await stallController.getStallById(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.stallId).to.equal("STALL001");
      expect(responseData.eventid).to.equal("Evt001");
    });

    it("should return 404 when stall not found", async () => {
      req.params = { eventid: "Evt001", id: "STALL999" };

      stallFindOneStub.resolves(null);

      await stallController.getStallById(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Stall not found.");
    });

    it("should handle database errors gracefully", async () => {
      req.params = { eventid: "Evt001", id: "STALL001" };

      stallFindOneStub.rejects(new Error("Database error"));

      await stallController.getStallById(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database error");
    });
  });

  describe("updateStall", () => {
    it("should update a stall with new data", async () => {
      req.params = { eventid: "Evt001", id: "STALL001" };
      req.body = {
        category: "Food & Beverages",
        price: 6000,
        location: "A2",
        availableStalls: 8,
        description: "Updated food stall",
        status: "Pending",
      };

      const mockStall = {
        _id: "507f191e810c19729de860eb",
        eventid: "Evt001",
        stallId: "STALL001",
        category: "Food & Beverages",
        price: 6000,
        location: "A2",
        availableStalls: 8,
        description: "Updated food stall",
        status: "Pending",
      };

      stallFindOneAndUpdateStub.resolves(mockStall);

      await stallController.updateStall(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.category).to.equal("Food & Beverages");
      expect(responseData.price).to.equal(6000);
      expect(responseData.status).to.equal("Pending");
    });

    it("should update stall image when provided", async () => {
      req.params = { eventid: "Evt001", id: "STALL001" };
      req.body = {
        category: "Food",
        price: 5000,
        location: "A1",
        availableStalls: 10,
        image: "new-stall.jpg",
      };

      const mockStall = {
        _id: "507f191e810c19729de860eb",
        eventid: "Evt001",
        stallId: "STALL001",
        category: "Food",
        price: 5000,
        location: "A1",
        availableStalls: 10,
        image: "new-stall.jpg",
      };

      stallFindOneAndUpdateStub.resolves(mockStall);

      await stallController.updateStall(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.image).to.equal("new-stall.jpg");
    });

    it("should return 404 when stall not found", async () => {
      req.params = { eventid: "Evt001", id: "STALL999" };
      req.body = { category: "Food", price: 5000 };

      stallFindOneAndUpdateStub.resolves(null);

      await stallController.updateStall(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Stall not found.");
    });

    it("should return 400 for validation errors", async () => {
      req.params = { eventid: "Evt001", id: "STALL001" };
      req.body = {
        category: "Food",
        price: -100,
        location: "A1",
        availableStalls: 10,
      };

      const error = new Error("Validation failed");
      error.name = "ValidationError";
      error.errors = {
        price: { message: "Price must be positive" },
      };
      stallFindOneAndUpdateStub.rejects(error);

      await stallController.updateStall(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.include("Price must be positive");
    });

    it("should handle database errors gracefully", async () => {
      req.params = { eventid: "Evt001", id: "STALL001" };
      req.body = { category: "Food", price: 5000 };

      stallFindOneAndUpdateStub.rejects(new Error("Database error"));

      await stallController.updateStall(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database error");
    });
  });

  describe("deleteStall", () => {
    it("should successfully delete a stall", async () => {
      req.params = { eventid: "Evt001", id: "STALL001" };

      const mockStall = {
        _id: "507f191e810c19729de860eb",
        eventid: "Evt001",
        stallId: "STALL001",
      };

      stallFindOneAndDeleteStub.resolves(mockStall);

      await stallController.deleteStall(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Stall deleted successfully.");
    });

    it("should return 404 when stall not found", async () => {
      req.params = { eventid: "Evt001", id: "STALL999" };

      stallFindOneAndDeleteStub.resolves(null);

      await stallController.deleteStall(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Stall not found.");
    });

    it("should handle database errors gracefully", async () => {
      req.params = { eventid: "Evt001", id: "STALL001" };

      stallFindOneAndDeleteStub.rejects(new Error("Database error"));

      await stallController.deleteStall(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database error");
    });
  });

  describe("getAllStalls", () => {
    it("should return all stalls across all events", async () => {
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

      await stallController.getAllStalls(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(2);
    });

    it("should return empty array when no stalls exist", async () => {
      stallFindStub.returns({
        sort: sinon.stub().resolves([]),
      });

      await stallController.getAllStalls(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(0);
    });

    it("should handle database errors gracefully", async () => {
      stallFindStub.returns({
        sort: sinon.stub().rejects(new Error("Database error")),
      });

      await stallController.getAllStalls(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Database error");
    });
  });
});
