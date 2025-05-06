import React from "react";
import Header from "../dashboard/components/Header";
import { Mail, User, Package, Crown, Trophy } from "lucide-react";
import Wrapper from "@/components/Wrapper";
import { Tables } from "@/types/types_db";
import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/utils/supabase/queries";
import ManagePlan from "@/components/ManagePlan";
import { SUBSCRIPTION_PLANS } from "@/types/subscription";
import Upgrade from "./Upgrade";
import MixpanelPageLogging from "@/components/mixpanel_page_logging";

const ProfilePage = async () => {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const [subscriptionData, usageData] = (
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .in("status", ["trialing", "active"])
        .eq("cancel_at_period_end", [false])
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),

      supabase.from("usage_stats").select("*").eq("user_id", user?.id).single(),
    ])
  ).map((response) => response.data) as [
    Tables<"subscriptions"> | null,
    Tables<"usage_stats"> | null
  ];
  const res = await fetch("https://ipinfo.io/json");
  const locationData = await res.json();
  const currentPlan = SUBSCRIPTION_PLANS.find(
    (plan) => plan.tier === subscriptionData?.tier
  );

  function isFutureDate(dateString: string) {
    const inputDate = new Date(dateString.replace(" ", "T"));
    const now = new Date();
    return inputDate > now;
  }

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <MixpanelPageLogging pageName="Profile Page" />
      <Wrapper className="lg:w-[60%]">
        <div className="py-8 space-y-6">
          {/* Profile Details Section */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-[#101828]">
                Profile Detail
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                {user?.user_metadata.avatar_url ? (
                  <div className="  rounded-full overflow-hidden relative">
                    <img
                      src={
                        user?.user_metadata.avatar_url ||
                        "https://github.com/shadcn.png"
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-[100px] h-[100px] lg:w-[200px] lg:h-[200px] rounded-full overflow-hidden relative bg-gray-200 flex items-center justify-center">
                    <User className="w-1/2 h-1/2 text-gray-500" />
                  </div>
                )}
                <div className="w-full space-y-4">
                  <div className="bg-[#EDEDED] flex items-center gap-2 rounded-lg p-4">
                    <User className="w-5 h-5 text-[#444]" />{" "}
                    <span className="text-[#444] text-sm font-satoshi font-medium">
                      {user?.user_metadata.name}
                    </span>
                  </div>
                  <div className="bg-[#EDEDED] flex items-center gap-2 rounded-lg p-4">
                    <Mail className="w-5 h-5 text-[#444]" />{" "}
                    <span className="text-[#444] text-sm">
                      {user?.user_metadata.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plan Section */}
          <div className="bg-white rounded-lg p-3 md:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className=" text-lg md:text-2xl font-semibold flex items-center gap-2">
                  <Package className="w-6 h-6 text-indigo-500" />
                  Current Plan
                </h2>
                <p className="text-sm text-gray-500 my-1">
                  Your subscription plan and usage
                </p>
              </div>
              {subscriptionData?.tier === "free" ? (
                <Upgrade />
              ) : subscriptionData?.tier !== "esewa" ? (
                <ManagePlan tier={subscriptionData?.tier || "free"} />
              ) : isFutureDate(subscriptionData.current_period_end) ? (
                ""
              ) : (
                <Upgrade />
              )}
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg my-2 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg  font-semibold flex items-center gap-2 capitalize">
                    {subscriptionData?.tier === "premium" && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                    {subscriptionData?.tier} Plan
                  </h3>
                  <p className="text-sm text-gray-500">
                    {subscriptionData?.status === "active" ||
                    subscriptionData?.status === "trialing"
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {locationData.country === "NP" ? "रु" : "$"}{" "}
                    {locationData.country === "NP"
                      ? subscriptionData?.tier === "esewa"
                        ? "350"
                        : "0"
                      : currentPlan?.limits.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    {locationData.country === "NP" ? (
                      isFutureDate(subscriptionData?.current_period_end!) ? (
                        `Expires on: ${
                          subscriptionData?.current_period_end.split("T")[0]
                        }`
                      ) : (
                        <>
                          <span className="font-bold text-red-600">
                            Expired Please Renew
                          </span>
                        </>
                      )
                    ) : (
                      "per month"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Credits Section */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-switzer font-medium  mb-4">Credits</h2>
            <p className="text-lg text-[#5141e5] font-satoshi font-semibold">
              {usageData?.ai_presentations_count}/
              {currentPlan?.limits.maxAIPresentations! > 1000
                ? "Unlimited"
                : currentPlan?.limits.maxAIPresentations}{" "}
              credits
            </p>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default ProfilePage;
