import { createClient } from "@supabase/supabase-js";

import { stripe } from "@/utils/stripe/config";
import { toDateTime } from "@/utils/helpers";

import { Database } from "@/types/types_db";

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export const createOrRetrieveCustomer = async ({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) => {
  const { data: customerData, error } = await supabaseAdmin
    .from("customers")
    .select("stripe_customer_id")
    .eq("id", uuid)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (customerData?.stripe_customer_id) {
    return customerData.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabaseUUID: uuid,
    },
  });

  const { error: upsertError } = await supabaseAdmin.from("customers").upsert(
    {
      id: uuid,
      stripe_customer_id: customer.id,
      email,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
      ignoreDuplicates: false,
    }
  );

  if (upsertError) throw upsertError;

  return customer.id;
};

export const initializeNewUser = async (userId: string, email: string) => {
  try {
    // First check if user already exists
    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("id", userId)
      .single();
    if (existingCustomer) {
      return true;
    }

    // If user doesn't exist, proceed with initialization
    const [customerResponse, subscriptionResponse, usageResponse] =
      await Promise.all([
        // Create customer record
        supabaseAdmin
          .from("customers")
          .insert([
            {
              id: userId,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single(),

        // Create free subscription
        supabaseAdmin
          .from("subscriptions")
          .insert([
            {
              id: `free_${userId}`,
              user_id: userId,
              tier: "free",
              status: "trialing",
              cancel_at_period_end: false,
              current_period_start: new Date().toISOString(),
              // end period 30 days from now
              current_period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single(),
        // Initialize usage stats
        supabaseAdmin
          .from("usage_stats")
          .insert([
            {
              user_id: userId,
              exports_count: 0,
              ai_presentations_count: 0,
              avatar_video_duration: 0,
              period_start: new Date().toISOString(),
              period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single(),
      ]);

    if (customerResponse.error) throw customerResponse.error;
    if (subscriptionResponse.error) throw subscriptionResponse.error;
    if (usageResponse.error) throw usageResponse.error;
    return true;
  } catch (error) {
    console.error("Error initializing user:", error);
    return false;
  }
};

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  const { data: customerData, error: customerError } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (customerError || !customerData) {
    console.error("Customer error:", customerError);
    throw new Error("Customer not found");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });
  const priceId = subscription.items.data[0].price.id;

  let tier: Database["public"]["Enums"]["subscription_tier"] = "free";
  // change for presentation generator
  if (priceId === "price_1RH1LSJwD2RujMHB6l7rVnUI") {
    tier = "standard";
  } else if (priceId === "price_1QQ1qjJwD2RujMHBNRyLgMmh") {
    tier = "premium";
  }

  const { error: subscriptionError } = await supabaseAdmin
    .from("subscriptions")
    .upsert({
      id: subscription.id,
      user_id: customerData.id,
      status:
        subscription.status as Database["public"]["Enums"]["subscription_status"],
      tier: tier,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: toDateTime(
        subscription.current_period_start
      ).toISOString(),
      current_period_end: toDateTime(
        subscription.current_period_end
      ).toISOString(),
      created_at: toDateTime(subscription.created).toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (subscriptionError) {
    console.error("Subscription error:", subscriptionError);
    throw subscriptionError;
  }

  // Reset usage stats for new billing period
  if (createAction) {
    const { error: usageError } = await supabaseAdmin
      .from("usage_stats")
      .upsert(
        {
          user_id: customerData.id,
          exports_count: 0,
          ai_presentations_count: 0,
          avatar_video_duration: 0,
          period_start: toDateTime(
            subscription.current_period_start
          ).toISOString(),
          period_end: toDateTime(subscription.current_period_end).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (usageError) {
      console.error("Usage stats error:", usageError);
      throw usageError;
    }
  }
};

export const manageEsewaPaymentSuccess = async (user_id: string) => {
  const { error: subscriptionError } = await supabaseAdmin
    .from("subscriptions")
    .upsert({
      id: `esewa_${user_id}`,
      user_id: user_id,
      status: "active",
      tier: "esewa",
      cancel_at_period_end: false,
      current_period_start: new Date().toISOString(),
      current_period_end: addDays(32),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  if (subscriptionError) {
    console.error("Subscription error:", subscriptionError);
    throw subscriptionError;
  }

  const { error: usageError } = await supabaseAdmin.from("usage_stats").upsert(
    {
      user_id: user_id,
      exports_count: 0,
      ai_presentations_count: 0,
      avatar_video_duration: 0,
      period_start: new Date().toISOString(),
      period_end: addDays(30),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    }
  );
  if (usageError) {
    console.error("Usage stats error:", usageError);
    throw usageError;
  }
};

const addDays = (days: number) => {
  const today = new Date();
  today.setDate(today.getDate() + days);
  return today.toISOString();
};
