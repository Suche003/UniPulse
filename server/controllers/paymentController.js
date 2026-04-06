import Payment from '../models/Payment.js';
import SponsorshipRequest from '../models/SponsorshipRequest.js';
import Sponsor from '../models/Sponsor.js';
import Event from '../models/Event.js';

// Admin: record a payment
export const recordPayment = async (req, res) => {
  try {
    const { sponsorshipRequestId, amount, transactionId, notes } = req.body;
    const request = await SponsorshipRequest.findById(sponsorshipRequestId)
      .populate('sponsor event');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Cannot record payment for non-accepted request' });
    }

    const payment = new Payment({
      sponsorshipRequest: sponsorshipRequestId,
      sponsor: request.sponsor._id,
      event: request.event._id,
      amount,
      transactionId,
      notes,
      status: 'completed',
      paidAt: new Date(),
    });
    await payment.save();

    // Update sponsor's amountPaid and paymentStatus
    const sponsor = request.sponsor;
    const totalPaid = (await Payment.aggregate([
      { $match: { sponsor: sponsor._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0;
    sponsor.amountPaid = totalPaid;
    if (totalPaid >= sponsor.totalAmount) sponsor.paymentStatus = 'paid';
    else if (totalPaid > 0) sponsor.paymentStatus = 'partial';
    else sponsor.paymentStatus = 'unpaid';
    await sponsor.save();

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Sponsor: get my payments
export const getMyPayments = async (req, res) => {
  try {
    const sponsorId = req.user.sub;
    const payments = await Payment.find({ sponsor: sponsorId })
      .populate('event', 'title date')
      .populate('sponsorshipRequest', 'proposedAmount counterAmount')
      .sort('-paidAt');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: get all payments (with filters)
export const getAllPayments = async (req, res) => {
  try {
    const { sponsorId, eventId } = req.query;
    const filter = {};
    if (sponsorId) filter.sponsor = sponsorId;
    if (eventId) filter.event = eventId;
    const payments = await Payment.find(filter)
      .populate('sponsor', 'name contactEmail')
      .populate('event', 'title')
      .populate('sponsorshipRequest')
      .sort('-paidAt');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
