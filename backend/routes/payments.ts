import express from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

interface AuthenticatedRequest extends express.Request {
  user?: any;
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

// Create Stripe Checkout Session
router.post('/create-checkout-session', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { amount, currency = 'usd', successUrl, cancelUrl } = req.body;

    if (!amount || amount < 100) { // Minimum $1.00 (100 cents)
      return res.status(400).json({ error: 'Amount must be at least $1.00' });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Success and cancel URLs are required' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'ComplianceScanner AI Donation',
              description: 'Support ComplianceScanner AI - Become a Supporter',
              images: ['https://compliance-scanner-ai.com/logo.png'], // Replace with your logo URL
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: req.user?.clerkId || req.user?.id,
        userEmail: req.user?.email,
        donationType: 'supporter',
      },
    });

    res.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

// Verify payment and update user status
router.post('/verify-payment', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment was not completed' });
    }

    // Verify the session belongs to the authenticated user
    if (session.metadata?.userId !== (req.user?.clerkId || req.user?.id)) {
      return res.status(403).json({ error: 'Unauthorized access to payment session' });
    }

    // Return success with payment details
    res.json({
      success: true,
      paymentStatus: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Webhook to handle Stripe events (optional, for additional security)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret || '');
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Payment successful for session:', session.id);
      // Here you could add additional logic like sending confirmation emails
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router; 