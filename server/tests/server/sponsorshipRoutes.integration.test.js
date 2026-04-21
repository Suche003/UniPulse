import { describe, it, before, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import express from "express";
import request from "supertest";
import sponsorshipRouter from "../../routes/sponsorshipRoutes.js";
import SponsorshipRequest from "../../models/SponsorshipRequest.js";
import Event from "../../models/Event.js";
import Sponsor from "../../models/Sponsor.js";
import Club from "../../models/Club.js";
import Notification from "../../models/Notification.js";
import Payment from "../../models/Payment.js";

describe("Sponsorship Routes Integration Tests", () => {
  let app;
  let sponsorshipFindByIdStub, sponsorshipFindStub, sponsorshipDeleteStub;
  let eventFindByIdStub, sponsorFindByIdStub, clubFindByIdStub;
  let notificationCreateStub, paymentCreateStub;

  before(() => {
    app = express();
    app.use(express.json());

    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = { sub: "user123", role: "club" };
      next();
    });

    app.use("/sponsorships", sponsorshipRouter);
  });

  beforeEach(() => {
    sponsorshipFindByIdStub = sinon.stub(SponsorshipRequest, "findById");
    sponsorshipFindStub = sinon.stub(SponsorshipRequest, "find");
    sponsorshipDeleteStub = sinon.stub(SponsorshipRequest.prototype, "deleteOne");
    eventFindByIdStub = sinon.stub(Event, "findById");
    sponsorFindByIdStub = sinon.stub(Sponsor, "findById");
    clubFindByIdStub = sinon.stub(Club, "findById");
    notificationCreateStub = sinon.stub(Notification, "create");
    paymentCreateStub = sinon.stub(Payment, "create");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("POST /sponsorships", () => {
    it("should create a sponsorship request successfully", async () => {
      const mockEvent = { _id: "evt001", title: "Tech Summit" };
      const mockSponsor = { _id: "spon001", name: "TechCorp", status: "approved" };
      const mockRequest = {
        _id: "req001",
        event: "evt001",
        sponsor: "spon001",
        club: "club001",
        proposedAmount: 5000,
        status: "pending",
      };

      eventFindByIdStub.resolves(mockEvent);
      sponsorFindByIdStub.resolves(mockSponsor);
      sinon.stub(SponsorshipRequest.prototype, "save").resolves(mockRequest);
      notificationCreateStub.resolves({ _id: "notif001" });

      const response = await request(app)
        .post("/sponsorships")
        .send({
          eventId: "evt001",
          sponsorId: "spon001",
          proposedAmount: 5000,
          message: "We would like to sponsor",
        });

      expect(response.status).to.equal(201);
      expect(response.body._id).to.equal("req001");
      expect(response.body.status).to.equal("pending");
    });

    it("should return 404 if event not found", async () => {
      eventFindByIdStub.resolves(null);

      const response = await request(app)
        .post("/sponsorships")
        .send({
          eventId: "evt999",
          sponsorId: "spon001",
          proposedAmount: 5000,
        });

      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Event not found");
    });

    it("should return 400 if sponsor not approved", async () => {
      const mockEvent = { _id: "evt001", title: "Tech Summit" };
      const mockSponsor = { _id: "spon001", status: "pending" };

      eventFindByIdStub.resolves(mockEvent);
      sponsorFindByIdStub.resolves(mockSponsor);

      const response = await request(app)
        .post("/sponsorships")
        .send({
          eventId: "evt001",
          sponsorId: "spon001",
          proposedAmount: 5000,
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Sponsor is not approved yet");
    });
  });

  describe("POST /sponsorships/detailed", () => {
    it("should create a detailed proposal successfully", async () => {
      const mockEvent = { _id: "evt001", title: "Tech Summit" };
      const mockSponsor = { _id: "spon001", name: "TechCorp", status: "approved" };
      const mockRequest = {
        _id: "req001",
        event: "evt001",
        sponsor: "spon001",
        proposedAmount: 5000,
        status: "pending",
      };

      eventFindByIdStub.resolves(mockEvent);
      sponsorFindByIdStub.resolves(mockSponsor);
      sinon.stub(SponsorshipRequest.prototype, "save").resolves(mockRequest);
      notificationCreateStub.resolves({ _id: "notif001" });

      const response = await request(app)
        .post("/sponsorships/detailed")
        .send({
          eventId: "evt001",
          sponsorId: "spon001",
          proposal: {
            packages: [
              { name: "Gold", amount: 5000 },
              { name: "Silver", amount: 3000 },
            ],
          },
        });

      expect(response.status).to.equal(201);
      expect(response.body._id).to.equal("req001");
    });
  });

  describe("GET /sponsorships/my-club-requests", () => {
    it("should return all requests for a club", async () => {
      const mockRequests = [
        {
          _id: "req001",
          event: { title: "Tech Summit" },
          sponsor: { name: "TechCorp" },
        },
      ];

      sponsorshipFindStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().returns({
            sort: sinon.stub().resolves(mockRequests),
          }),
        }),
      });

      const response = await request(app).get("/sponsorships/my-club-requests");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.equal(1);
    });
  });

  describe("GET /sponsorships/my-requests", () => {
    it("should return all requests for a sponsor", async () => {
      const mockRequests = [
        {
          _id: "req001",
          event: { title: "Tech Summit" },
          club: { clubName: "Tech Club" },
        },
      ];

      sponsorshipFindStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().returns({
            sort: sinon.stub().resolves(mockRequests),
          }),
        }),
      });

      const response = await request(app).get("/sponsorships/my-requests");

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
    });
  });

  describe("PATCH /sponsorships/:requestId/respond", () => {
    it("should accept a sponsorship request", async () => {
      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "user123", toString: () => "user123" },
        club: { _id: "club001" },
        event: { title: "Tech Summit" },
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().resolves(mockRequest),
        }),
      });

      notificationCreateStub.resolves({ _id: "notif001" });

      const response = await request(app)
        .patch("/sponsorships/req001/respond")
        .send({ action: "accept", amount: 5000 });

      expect(response.status).to.equal(200);
      expect(mockRequest.status).to.equal("accepted");
    });

    it("should decline a sponsorship request", async () => {
      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "user123", toString: () => "user123" },
        club: { _id: "club001" },
        event: { title: "Tech Summit" },
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().resolves(mockRequest),
        }),
      });

      notificationCreateStub.resolves({ _id: "notif001" });

      const response = await request(app)
        .patch("/sponsorships/req001/respond")
        .send({ action: "decline" });

      expect(response.status).to.equal(200);
      expect(mockRequest.status).to.equal("declined");
    });

    it("should return 400 for invalid action", async () => {
      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "user123", toString: () => "user123" },
        club: { _id: "club001" },
        event: { title: "Tech Summit" },
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().resolves(mockRequest),
        }),
      });

      const response = await request(app)
        .patch("/sponsorships/req001/respond")
        .send({ action: "invalid_action" });

      expect(response.status).to.equal(400);
    });
  });

  describe("PATCH /sponsorships/:requestId/club-respond", () => {
    it("should accept a counter offer", async () => {
      const mockRequest = {
        _id: "req001",
        club: { _id: "user123", toString: () => "user123" },
        sponsor: { _id: "spon001" },
        event: { title: "Tech Summit" },
        status: "countered",
        counterAmount: 4500,
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().resolves(mockRequest),
        }),
      });

      notificationCreateStub.resolves({ _id: "notif001" });

      const response = await request(app)
        .patch("/sponsorships/req001/club-respond")
        .send({ action: "accept_counter" });

      expect(response.status).to.equal(200);
      expect(mockRequest.status).to.equal("accepted");
    });
  });

  describe("PATCH /sponsorships/:requestId/sign", () => {
    it("should sign contract successfully", async () => {
      const mockRequest = {
        _id: "req001",
        sponsor: { toString: () => "user123" },
        club: { toString: () => "club001" },
        signedBySponsor: false,
        signedByClub: false,
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.resolves(mockRequest);

      const response = await request(app)
        .patch("/sponsorships/req001/sign")
        .send({});

      expect(response.status).to.equal(200);
      expect(mockRequest.signedBySponsor).to.be.true;
    });
  });

  describe("PATCH /sponsorships/:requestId/accept-proposal", () => {
    it("should accept a proposal", async () => {
      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "user123", toString: () => "user123" },
        club: { _id: "club001" },
        event: { title: "Tech Summit" },
        save: sinon.stub().resolves(),
      };

      const mockClub = { _id: "club001" };

      sponsorshipFindByIdStub.resolves(mockRequest);
      clubFindByIdStub.resolves(mockClub);
      notificationCreateStub.resolves({ _id: "notif001" });

      const response = await request(app)
        .patch("/sponsorships/req001/accept-proposal")
        .send({
          selectedPackage: { name: "Gold", amount: 5000 },
          paymentDeadline: "2024-05-15",
        });

      expect(response.status).to.equal(200);
      expect(mockRequest.status).to.equal("accepted");
    });
  });

  describe("PATCH /sponsorships/:requestId/coordination", () => {
    it("should update coordination materials successfully", async () => {
      const mockRequest = {
        _id: "req001",
        sponsor: { toString: () => "user123" },
        club: { toString: () => "club001" },
        materialsSubmitted: new Map(),
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.resolves(mockRequest);

      const response = await request(app)
        .patch("/sponsorships/req001/coordination")
        .send({
          type: "materials",
          data: { logo: "submitted", banner: "pending" },
        });

      expect(response.status).to.equal(200);
    });

    it("should return 400 for invalid update type", async () => {
      const mockRequest = {
        _id: "req001",
        sponsor: { toString: () => "user123" },
        club: { toString: () => "club001" },
      };

      sponsorshipFindByIdStub.resolves(mockRequest);

      const response = await request(app)
        .patch("/sponsorships/req001/coordination")
        .send({
          type: "invalid_type",
          data: {},
        });

      expect(response.status).to.equal(400);
    });
  });

  describe("PATCH /sponsorships/:requestId/meeting-completed", () => {
    it("should mark meeting as completed", async () => {
      const mockRequest = {
        _id: "req001",
        club: { _id: "user123", toString: () => "user123" },
        sponsor: { _id: "spon001" },
        event: { title: "Tech Summit" },
        meetingCompleted: false,
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().resolves(mockRequest),
      });

      notificationCreateStub.resolves({ _id: "notif001" });

      const response = await request(app)
        .patch("/sponsorships/req001/meeting-completed")
        .send({});

      expect(response.status).to.equal(200);
      expect(mockRequest.meetingCompleted).to.be.true;
    });
  });

  describe("DELETE /sponsorships/:requestId", () => {
    it("should cancel a pending request", async () => {
      const mockRequest = {
        _id: "req001",
        club: { toString: () => "user123" },
        status: "pending",
        deleteOne: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.resolves(mockRequest);

      const response = await request(app).delete("/sponsorships/req001");

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Request cancelled");
    });

    it("should return 400 if request is not pending", async () => {
      const mockRequest = {
        _id: "req001",
        club: { toString: () => "user123" },
        status: "accepted",
      };

      sponsorshipFindByIdStub.resolves(mockRequest);

      const response = await request(app).delete("/sponsorships/req001");

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Cannot cancel non-pending request");
    });
  });
});
