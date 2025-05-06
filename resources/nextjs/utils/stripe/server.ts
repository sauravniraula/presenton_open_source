'use server';

import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { createOrRetrieveCustomer } from '@/utils/supabase/admin';
import {
  getURL,
  getErrorRedirect,
} from '@/utils/helpers';




type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};
type checkOutParams ={
  price:string;
  priceType:string;

}
export async function checkoutWithStripe(
  details: checkOutParams ,
  redirectPath: string = '/payment-success'
): Promise<CheckoutResponse> {
  try {
    const supabase = await createClient();
    const { error, data: { user } } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('Authentication required');
    }

    // Validate price ID
    if (!details.price) {
      throw new Error('Invalid price ID');
    }

    const customer = await createOrRetrieveCustomer({
      uuid: user.id,
      email: user.email || ''
    });

    const params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer,
      mode: 'subscription',
      customer_update: {
        address: 'auto'
      },
      line_items: [
        {
          price: details.price,
          quantity: 1
        }
      ],
      // Add automatic tax calculation if needed
      // automatic_tax: { enabled: true },
      // NO CANCEL URL TO PROFILE PAGE
      cancel_url: `${getURL()}/profile?error=checkout_cancelled`,
      success_url: `${getURL()}${redirectPath}?success=true`
    };

    const session = await stripe.checkout.sessions.create(params);
    
    if (!session?.id) {
      throw new Error('Failed to create checkout session');
    }

    return { sessionId: session.id };

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      errorRedirect: getErrorRedirect(
        redirectPath,
        error instanceof Error ? error.message : 'Payment processing failed',
        'Please try again later or contact support.'
      )
    };
  }
}

export async function createStripePortal(currentPath: string) {
  try {
    const supabase = await createClient();
    const {
      error,
      data: { user }
    } = await  supabase.auth.getUser();

    if (!user) {
      if (error) {
        console.error(error);
      }
      throw new Error('Could not get user session.');
    }

    let customer;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id || '',
        email: user.email || ''
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    if (!customer) {
      throw new Error('Could not get customer.');
    }

    try {
      const { url } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: getURL('account')
      });
      if (!url) {
        throw new Error('Could not create billing portal');
      }
      return url;
    } catch (err) {
      console.error(err);
      throw new Error('Could not create billing portal');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return getErrorRedirect(
        currentPath,
        error.message,
        'Please try again later or contact a system administrator.'
      );
    } else {
      return getErrorRedirect(
        currentPath,
        'An unknown error occurred.',
        'Please try again later or contact a system administrator.'
      );
    }
  }
}
