import Stripe from "stripe";
import { stripe } from "@/utils/stripe/config";
import { manageSubscriptionStatusChange } from "@/utils/supabase/admin";

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

  if (!sig || !webhookSecret) {
    console.error("Missing stripe signature or webhook secret");
    return new Response("Configuration error", { status: 500 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    if (!relevantEvents.has(event.type)) {
      return new Response(`Ignored event type: ${event.type}`, { status: 200 });
    }

    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          console.log(
            "customer.subscription.created, updated, or deleted",
            event.type
          );
          const subscription = event.data.object as Stripe.Subscription;
          if (!subscription.customer) {
            throw new Error("No customer found on subscription");
          }
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created"
          );
          break;
        }

        case "checkout.session.completed": {
          console.log("checkout.session.completed");
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (!checkoutSession.customer || !checkoutSession.subscription) {
            throw new Error(
              "Missing customer or subscription in checkout session"
            );
          }

          if (checkoutSession.mode === "subscription") {
            await manageSubscriptionStatusChange(
              checkoutSession.subscription as string,
              checkoutSession.customer as string,
              true
            );
          }
          break;
        }
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
      console.error("Webhook handler error:", error);
      return new Response(
        `Webhook handler failed. View logs.${error}`,

        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 400 }
    );
  }
}
