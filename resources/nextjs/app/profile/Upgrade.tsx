"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/utils/stripe/client";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { checkoutWithStripe } from "@/utils/stripe/server";
import { MixpanelEventName } from "@/utils/mixpanel/enums";
import { sendMpEvent } from "@/utils/mixpanel/services";
import { handlePayment } from "../(presentation-generator)/utils/update-payment";
import { Loader2, Zap } from "lucide-react";

const Upgrade = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const handleSubscription = async () => {
    setLoading(true);
    sendMpEvent(MixpanelEventName.upgradePlanClicked);

    if (!user) {
      sendMpEvent(MixpanelEventName.notAuthenticated);
      router.push("/auth/login");
      return;
    }
    await handlePayment();
    setLoading(false);
  };
  return (
    <Button
      variant="default"
      className="bg-indigo-600 hover:bg-indigo-700 font-semibold"
      onClick={handleSubscription}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upgrade
      Plan <Zap fill="#fff" className=" h-4 w-4" />
    </Button>
  );
};

export default Upgrade;
