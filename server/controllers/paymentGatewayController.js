import Stripe from 'stripe';
import SponsorshipRequest from '../models/SponsorshipRequest.js';
import Payment from '../models/Payment.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';
import { sendEmail } from '../utils/email.js';

// Initialize Stripe only if secret key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️ Stripe secret key is missing. Payment features will not work.');
}

// Create Stripe Checkout session
export const createCheckoutSession = async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: 'Payment gateway not configured' });
  }

  try {
    const { requestId } = req.params;
    const sponsorId = req.user.sub;

    const request = await SponsorshipRequest.findById(requestId)
      .populate('event', 'title')
      .populate('sponsor', 'name contactEmail')
      .populate('club', 'clubName email');
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.sponsor.toString() !== sponsorId) return res.status(403).json({ message: 'Not your request' });
    if (request.status !== 'accepted') return res.status(400).json({ message: 'Request not accepted' });

    const amount = request.agreedPackage?.amount || request.proposedAmount;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Sponsorship: ${request.event.title}`,
            description: `${request.agreedPackage?.name || 'Custom'} package for ${request.event.title}`,
          },
          unit_amount: Math.round(amount * 100), // Stripe uses cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/sponsor/dashboard?payment_success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/sponsor/dashboard?payment_cancelled=true`,
      metadata: {
        requestId: request._id.toString(),
        sponsorId: sponsorId,
        eventId: request.event._id.toString(),
        clubId: request.club._id.toString(),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Webhook to handle successful payment (called by Stripe)
export const handleStripeWebhook = async (req, res) => {
  if (!stripe) {
    console.error('Stripe not configured, cannot process webhook');
    return res.status(500).send('Payment gateway not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { requestId, sponsorId, eventId, clubId } = session.metadata;

    try {
      const request = await SponsorshipRequest.findById(requestId);
      if (!request) throw new Error('Request not found');

      const amount = session.amount_total / 100;

      // Create payment record
      const payment = new Payment({
        sponsorshipRequest: requestId,
        sponsor: sponsorId,
        event: eventId,
        amount,
        transactionId: session.id,
        status: 'completed',
        paidAt: new Date(),
      });
      await payment.save();

      // Update sponsor's amountPaid and paymentStatus
      const sponsor = await Sponsor.findById(sponsorId);
      const totalPaid = (await Payment.aggregate([
        { $match: { sponsor: sponsor._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]))[0]?.total || 0;
      sponsor.amountPaid = totalPaid;
      sponsor.paymentStatus = totalPaid >= sponsor.totalAmount ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
      await sponsor.save();

      // Update request payment status
      request.paymentStatus = 'paid';
      await request.save();

      // Notify club
      const club = await Club.findById(clubId);
      await sendEmail({
        to: club.email,
        subject: 'Sponsorship Payment Received',
        html: `<p><strong>${sponsor.name}</strong> has paid <strong>$${amount}</strong> for your event "${request.event.title}".</p>
               <p>Transaction ID: ${session.id}</p>
               <p>You can view the receipt in your dashboard.</p>`
      });

      console.log(`Payment received: Sponsor ${sponsor.name} paid $${amount} for event ${request.event.title}`);
      res.json({ received: true });
    } catch (err) {
      console.error('Error processing webhook:', err);
      return res.status(500).send('Webhook processing failed');
    }
  }

  res.json({ received: true });
};