import { describe, it, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import * as sponsorshipController from "../../controllers/sponsorshipController.js";
import SponsorshipRequest from "../../models/SponsorshipRequest.js";
import Event from "../../models/Event.js";
import Sponsor from "../../models/Sponsor.js";
import Club from "../../models/Club.js";
import Notification from "../../models/Notification.js";
import Payment from "../../models/Payment.js";

describe("Sponsorship Controller", () => {
  let req, res;
  let sponsorshipFindByIdStub, sponsorshipFindStub, sponsorshipSaveStub;
  let eventFindByIdStub, sponsorFindByIdStub, clubFindByIdStub;
  let notificationCreateStub, paymentCreateStub, paymentAggregateStub;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { sub: "user123", role: "club" },
      file: null,
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };

    sponsorshipFindByIdStub = sinon.stub(SponsorshipRequest, "findById");
    sponsorshipFindStub = sinon.stub(SponsorshipRequest, "find");
    eventFindByIdStub = sinon.stub(Event, "findById");
    sponsorFindByIdStub = sinon.stub(Sponsor, "findById");
    clubFindByIdStub = sinon.stub(Club, "findById");
    notificationCreateStub = sinon.stub(Notification, "create");
    paymentCreateStub = sinon.stub(Payment, "create");
    paymentAggregateStub = sinon.stub(Payment, "aggregate");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createRequest", () => {
    it("should return 404 if event not found", async () => {
      req.body = { eventId: "evt999", sponsorId: "spon001", proposedAmount: 5000 };

      eventFindByIdStub.resolves(null);

      await sponsorshipController.createRequest(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Event not found");
    });

    it("should return 404 if sponsor not found", async () => {
      req.body = { eventId: "evt001", sponsorId: "spon999", proposedAmount: 5000 };

      const mockEvent = { _id: "evt001", title: "Tech Summit" };
      eventFindByIdStub.resolves(mockEvent);
      sponsorFindByIdStub.resolves(null);

      await sponsorshipController.createRequest(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 400 if sponsor is not approved", async () => {
      req.body = { eventId: "evt001", sponsorId: "spon001", proposedAmount: 5000 };

      const mockEvent = { _id: "evt001", title: "Tech Summit" };
      const mockSponsor = { _id: "spon001", status: "pending" };

      eventFindByIdStub.resolves(mockEvent);
      sponsorFindByIdStub.resolves(mockSponsor);

      await sponsorshipController.createRequest(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Sponsor is not approved yet");
    });
  });

  describe("getSponsorRequests", () => {
    it("should return all requests for a sponsor", async () => {
      req.user = { sub: "spon001", role: "sponsor" };

      const mockRequests = [
        {
          _id: "req001",
          event: { title: "Tech Summit" },
          club: { clubName: "Tech Club" },
        },
        {
          _id: "req002",
          event: { title: "Startup Fair" },
          club: { clubName: "Entrepreneurship Club" },
        },
      ];

      sponsorshipFindStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().returns({
            sort: sinon.stub().resolves(mockRequests),
          }),
        }),
      });

      await sponsorshipController.getSponsorRequests(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(2);
    });

    it("should return empty array when no requests exist", async () => {
      req.user = { sub: "spon001", role: "sponsor" };

      sponsorshipFindStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().returns({
            sort: sinon.stub().resolves([]),
          }),
        }),
      });

      await sponsorshipController.getSponsorRequests(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
    });
  });

  describe("respondToRequest", () => {
    it("should accept a sponsorship request", async () => {
      req.params = { requestId: "req001" };
      req.body = { action: "accept", amount: 5000 };
      req.user = { sub: "spon001", role: "sponsor" };

      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "spon001", toString: () => "spon001" },
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

      await sponsorshipController.respondToRequest(req, res);

      expect(mockRequest.status).to.equal("accepted");
      expect(mockRequest.counterAmount).to.equal(5000);
      expect(res.json.calledOnce).to.be.true;
    });

    it("should decline a sponsorship request", async () => {
      req.params = { requestId: "req001" };
      req.body = { action: "decline" };
      req.user = { sub: "spon001", role: "sponsor" };

      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "spon001", toString: () => "spon001" },
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

      await sponsorshipController.respondToRequest(req, res);

      expect(mockRequest.status).to.equal("declined");
    });

    it("should return 403 if not your request", async () => {
      req.params = { requestId: "req001" };
      req.body = { action: "accept", amount: 5000 };
      req.user = { sub: "spon999", role: "sponsor" };

      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "spon001", toString: () => "spon001" },
        club: { _id: "club001" },
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().resolves(mockRequest),
        }),
      });

      await sponsorshipController.respondToRequest(req, res);

      expect(res.status.calledWith(403)).to.be.true;
    });

    it("should return 400 for invalid action", async () => {
      req.params = { requestId: "req001" };
      req.body = { action: "invalid_action" };
      req.user = { sub: "spon001", role: "sponsor" };

      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "spon001", toString: () => "spon001" },
        club: { _id: "club001" },
        event: { title: "Tech Summit" },
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().resolves(mockRequest),
        }),
      });

      await sponsorshipController.respondToRequest(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.equal("Invalid action");
    });
  });

  describe("clubRespond", () => {
    it("should accept a counter offer", async () => {
      req.params = { requestId: "req001" };
      req.body = { action: "accept_counter" };
      req.user = { sub: "club001", role: "club" };

      const mockRequest = {
        _id: "req001",
        club: { _id: "club001", toString: () => "club001" },
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

      await sponsorshipController.clubRespond(req, res);

      expect(mockRequest.status).to.equal("accepted");
      expect(mockRequest.proposedAmount).to.equal(4500);
    });

    it("should decline a counter offer", async () => {
      req.params = { requestId: "req001" };
      req.body = { action: "decline_counter" };
      req.user = { sub: "club001", role: "club" };

      const mockRequest = {
        _id: "req001",
        club: { _id: "club001", toString: () => "club001" },
        sponsor: { _id: "spon001" },
        event: { title: "Tech Summit" },
        status: "countered",
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().resolves(mockRequest),
        }),
      });

      notificationCreateStub.resolves({ _id: "notif001" });

      await sponsorshipController.clubRespond(req, res);

      expect(mockRequest.status).to.equal("declined");
    });

    it("should return 400 for invalid state or action", async () => {
      req.params = { requestId: "req001" };
      req.body = { action: "invalid_action" };
      req.user = { sub: "club001", role: "club" };

      const mockRequest = {
        _id: "req001",
        club: { _id: "club001", toString: () => "club001" },
        sponsor: { _id: "spon001" },
        event: { title: "Tech Summit" },
        status: "accepted",
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().resolves(mockRequest),
        }),
      });

      await sponsorshipController.clubRespond(req, res);

      expect(res.status.calledWith(400)).to.be.true;
    });
  });

  describe("signContract", () => {
    it("should sign contract as sponsor", async () => {
      req.params = { requestId: "req001" };
      req.user = { sub: "spon001", role: "sponsor" };

      const mockRequest = {
        _id: "req001",
        sponsor: { toString: () => "spon001" },
        club: { toString: () => "club001" },
        signedBySponsor: false,
        signedByClub: false,
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.resolves(mockRequest);

      await sponsorshipController.signContract(req, res);

      expect(mockRequest.signedBySponsor).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it("should sign contract as club", async () => {
      req.params = { requestId: "req001" };
      req.user = { sub: "club001", role: "club" };

      const mockRequest = {
        _id: "req001",
        sponsor: { toString: () => "spon001" },
        club: { toString: () => "club001" },
        signedBySponsor: false,
        signedByClub: false,
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.resolves(mockRequest);

      await sponsorshipController.signContract(req, res);

      expect(mockRequest.signedByClub).to.be.true;
    });

    it("should set signedAt when both parties sign", async () => {
      req.params = { requestId: "req001" };
      req.user = { sub: "club001", role: "club" };

      const mockRequest = {
        _id: "req001",
        sponsor: { toString: () => "spon001" },
        club: { toString: () => "club001" },
        signedBySponsor: true,
        signedByClub: false,
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.resolves(mockRequest);

      await sponsorshipController.signContract(req, res);

      expect(mockRequest.signedByClub).to.be.true;
      expect(mockRequest.signedAt).to.exist;
    });
  });

  describe("createDetailedProposal", () => {
    it("should create a detailed proposal successfully", async () => {
      req.body = {
        eventId: "evt001",
        sponsorId: "spon001",
        proposal: {
          packages: [{ amount: 5000 }],
        },
      };
      req.user.sub = "club001";

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

      await sponsorshipController.createDetailedProposal(req, res);

      expect(res.status.calledWith(201)).to.be.true;
    });
  });

  describe("acceptProposal", () => {
    it("should accept a proposal successfully", async () => {
      req.params = { requestId: "req001" };
      req.body = {
        selectedPackage: { name: "Gold", amount: 5000 },
        paymentDeadline: "2024-05-15",
        materialsNeeded: ["logo", "banner"],
      };
      req.user = { sub: "spon001", role: "sponsor" };

      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "spon001", toString: () => "spon001" },
        club: { _id: "club001" },
        event: { title: "Tech Summit" },
        save: sinon.stub().resolves(),
      };

      const mockClub = { _id: "club001" };

      sponsorshipFindByIdStub.resolves(mockRequest);
      clubFindByIdStub.resolves(mockClub);
      notificationCreateStub.resolves({ _id: "notif001" });

      await sponsorshipController.acceptProposal(req, res);

      expect(mockRequest.status).to.equal("accepted");
      expect(mockRequest.agreedPackage).to.deep.equal({ name: "Gold", amount: 5000 });
      expect(res.json.calledOnce).to.be.true;
    });
  });

  describe("recordPayment", () => {
    it("should return 400 if request not accepted", async () => {
      req.params = { requestId: "req001" };
      req.body = { amount: 5000, transactionId: "txn123" };
      req.user = { sub: "spon001", role: "sponsor" };

      const mockRequest = {
        _id: "req001",
        sponsor: { _id: "spon001", toString: () => "spon001" },
        event: { _id: "evt001" },
        status: "pending",
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().resolves(mockRequest),
        }),
      });

      await sponsorshipController.recordPayment(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData.message).to.include("not accepted");
    });
  });

  describe("getClubRequests", () => {
    it("should return all requests for a club", async () => {
      req.user = { sub: "club001", role: "club" };

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

      await sponsorshipController.getClubRequests(req, res);

      expect(res.json.calledOnce).to.be.true;
      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.be.an("array");
      expect(responseData.length).to.equal(1);
    });
  });

  describe("markMeetingCompleted", () => {
    it("should mark meeting as completed", async () => {
      req.params = { requestId: "req001" };
      req.user = { sub: "club001", role: "club" };

      const mockRequest = {
        _id: "req001",
        club: { _id: "club001", toString: () => "club001" },
        sponsor: { _id: "spon001" },
        event: { title: "Tech Summit" },
        meetingCompleted: false,
        save: sinon.stub().resolves(),
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().resolves(mockRequest),
      });

      notificationCreateStub.resolves({ _id: "notif001" });

      await sponsorshipController.markMeetingCompleted(req, res);

      expect(mockRequest.meetingCompleted).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it("should return 403 if not your request", async () => {
      req.params = { requestId: "req001" };
      req.user = { sub: "club999", role: "club" };

      const mockRequest = {
        _id: "req001",
        club: { _id: "club001", toString: () => "club001" },
        sponsor: { _id: "spon001" },
        event: { title: "Tech Summit" },
      };

      sponsorshipFindByIdStub.returns({
        populate: sinon.stub().resolves(mockRequest),
      });

      await sponsorshipController.markMeetingCompleted(req, res);

      expect(res.status.calledWith(403)).to.be.true;
    });
  });
});