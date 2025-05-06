import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_PLANS } from "@/types/subscription";
import { Tables } from "@/types/types_db";
import { supabase } from "@/utils/supabase/client";
import { UserPreferencesService } from "@/app/(presentation-generator)/services/userPreferences";

type UsageStats = Tables<"usage_stats">;
type Subscription = Tables<"subscriptions">;

interface Usage {
  userId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  subscription: {
    tier: Subscription["tier"];
    status: Subscription["status"];
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
  };
  usage: {
    exports: UsageStats["exports_count"];
    aiPresentations: UsageStats["ai_presentations_count"];
    avatarVideoDuration: UsageStats["avatar_video_duration"];
    // @ts-ignore
    pdf_exports: UsageStats["pdf_export_count"];
    // @ts-ignore
    pptx_exports: UsageStats["pptx_export_count"];
    // @ts-ignore
    convert_to_video: UsageStats["convert_to_video"];
  };
}

type UsageType =
  | "exports"
  | "aiPresentations"
  | "avatarVideoDuration"
  | "slides"
  | "fileSize"
  | "pdf_exports"
  | "pptx_exports"
  | "convert_to_video";

export function useUsageTracking() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsage = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;

      // Get both subscription and usage data in parallel
      const [subscriptionResponse, usageResponse] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", session.user.id)
          .in("status", ["trialing", "active"])
          .eq("cancel_at_period_end", [false])
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("usage_stats")
          .select("*")
          .eq("user_id", session.user.id)
          .single(),
      ]);

      let subscription = subscriptionResponse.data;
      let usageStats = usageResponse.data;

      // If no subscription exists, create a free tier subscription
      if (!subscription) {
        const { data: newSubscription, error: subError } = await supabase
          .from("subscriptions")
          .insert([
            {
              id: `free_${session.user.id}`,
              user_id: session.user.id,
              tier: "free" as const,
              status: "active" as const,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              cancel_at_period_end: false,
            },
          ])
          .select()
          .single();

        if (subError) throw subError;
        subscription = newSubscription;
      }

      // If no usage stats exist, create them
      if (!usageStats) {
        const { data: newUsage, error: usageError } = await supabase
          .from("usage_stats")
          .insert([
            {
              user_id: session.user.id,
              exports_count: 0,
              ai_presentations_count: 0,
              avatar_video_duration: 0,
              period_start: new Date().toISOString(),
              period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ])
          .select()
          .single();

        if (usageError) throw usageError;
        usageStats = newUsage;
      }

      // Both subscription and usageStats are guaranteed to be non-null here
      if (subscription && usageStats) {
        setUsage({
          userId: session.user.id,
          currentPeriodStart: new Date(subscription.current_period_start),
          currentPeriodEnd: new Date(subscription.current_period_end),
          subscription: {
            tier: subscription.tier,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: subscription.current_period_end,
          },
          usage: {
            exports: usageStats.exports_count,
            aiPresentations: usageStats.ai_presentations_count,
            avatarVideoDuration: usageStats.avatar_video_duration,
            pdf_exports: usageStats.pdf_export_count,
            pptx_exports: usageStats.pptx_export_count,
            convert_to_video: usageStats.convert_to_video,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch usage data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);
  const isCurrentPeriodExceed = (date: string) => {
    const inputDate = new Date(date.replace(" ", "T"));
    const now = new Date();
    return inputDate >= now;
  };

  const checkLimit = async (type: UsageType, amount: number = 1) => {
    if (!usage) return false;

    const plan = SUBSCRIPTION_PLANS.find(
      (p) =>
        p.tier === usage.subscription.tier ||
        "esewa" === usage.subscription.tier
    );
    if (!plan) return false;
    // IF SEewa
    if (usage.subscription.tier === "esewa") {
      const isPeriodExceed = isCurrentPeriodExceed(
        usage.subscription.currentPeriodEnd
      );

      if (isPeriodExceed) {
        return true;
      } else {
        return false;
      }
    }

    switch (type) {
      case "exports":
        return usage.usage.exports + amount <= plan.limits.maxExports;
      case "aiPresentations":
        return (
          usage.usage.aiPresentations + amount <= plan.limits.maxAIPresentations
        );
      case "avatarVideoDuration":
        return (
          usage.usage.avatarVideoDuration + amount <=
          plan.limits.avatarVideoDuration
        );
      case "slides":
        return amount <= plan.limits.maxSlides;
      case "fileSize":
        return amount <= plan.limits.maxFileSize;
      case "pdf_exports":
        return true;
      case "pptx_exports":
        return true;
      case "convert_to_video":
        return true;
      default:
        return false;
    }
  };

  const incrementUsage = async (
    type: keyof Usage["usage"],
    amount: number = 1
  ) => {
    if (!usage) return false;
    try {
      // Check limit before attempting to increment
      const canIncrement = await checkLimit(type, amount);
      if (!canIncrement) {
        toast({
          variant: "destructive",
          title: "Usage Limit Reached",
          description: "Please upgrade your plan to continue.",
        });
        window.location.href = "/profile";
        return false;
      }

      // Map the type to the correct database column name
      const columnMapping = {
        exports: "exports_count",
        aiPresentations: "ai_presentations_count",
        avatarVideoDuration: "avatar_video_duration",
        pdf_exports: "pdf_export_count",
        pptx_exports: "pptx_export_count",
        convert_to_video: "convert_to_video",
      };

      const columnName = columnMapping[type];
      if (!columnName) {
        console.error("Invalid usage type:", type);
        return false;
      }

      const { error } = await supabase
        .from("usage_stats")
        .update({ [columnName]: usage.usage[type] + amount })
        .eq("user_id", usage.userId);

      if (error) throw error;

      await fetchUsage();
      return true;
    } catch (error) {
      console.error("Error incrementing usage:", error);
      return false;
    }
  };

  return {
    usage,
    loading,
    checkLimit,
    incrementUsage,
    refreshUsage: fetchUsage,
  };
}
