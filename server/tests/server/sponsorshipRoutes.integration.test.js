import { describe, before, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import express from "express";
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
});