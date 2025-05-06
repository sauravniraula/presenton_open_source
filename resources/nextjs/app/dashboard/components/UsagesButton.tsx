"use client";
import { SUBSCRIPTION_PLANS } from "@/types/subscription";
import { Tables } from "@/types/types_db";
import { getUser } from "@/utils/supabase/queries";
import React from "react";

import { supabase } from "@/utils/supabase/client";
import { Infinity, Zap } from "lucide-react";
const UsagesButton = () => {
  const [usageInfo, setUsageInfo] = React.useState<{
    subscription: Tables<"subscriptions"> | null;
    usage: Tables<"usage_stats"> | null;
    error?: string;
  }>({ subscription: null, usage: null });

  React.useEffect(() => {
    async function fetchUsageData() {
      try {
        const user = await getUser(supabase);
        if (!user) throw new Error("User not found");

        const [subscriptionData, usageData] = (
          await Promise.all([
            supabase
              .from("subscriptions")
              .select("*")
              .eq("user_id", user.id)
              .in("status", ["trialing", "active"])
              .eq("cancel_at_period_end", [false])
              .order("created_at", { ascending: false })
              .limit(1)
              .single(),

            supabase
              .from("usage_stats")
              .select("*")
              .eq("user_id", user.id)
              .single(),
          ])
        ).map((response) => response.data);

        setUsageInfo({ subscription: subscriptionData, usage: usageData });
      } catch (error) {
        console.error("Error fetching usage data:", error);
        setUsageInfo((prev) => ({
          ...prev,
          error: "Failed to load usage data",
        }));
      }
    }

    fetchUsageData();
  }, []);

  if (usageInfo.subscription === null || usageInfo.usage === null) {
    return null;
  }
  if (usageInfo.error) {
    return null; // Or return an error state UI
  }

  return (
    <a
      href="/profile"
      className="flex items-center gap-2 border-2 px-4 py-1 sm:py-2 rounded-full cursor-pointer hover:text-gray-200 duration-300"
    >
      <Zap className="w-4 h-4 text-white" />
      {usageInfo.subscription!.tier === "free" ? (
        <p className="font-neue-montreal flex font-bold text-white">
          {usageInfo.usage?.ai_presentations_count}/{5}
        </p>
      ) : (
        <p className="font-neue-montreal hidden sm:flex font-bold text-xs sm:text-sm text-white">
          Unlimited
        </p>
      )}
      {usageInfo.subscription!.tier === "free" && (
        <p className="font-neue-montreal  font-medium hidden sm:block text-white">
          Upgrade
        </p>
      )}
    </a>
  );
};

export default UsagesButton;
