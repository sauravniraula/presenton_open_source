import Stripe from 'stripe';



export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? '',
  {
    appInfo: {
      name: 'PresentOn AI',
      version: '1.0.0'
    }
  }
);
