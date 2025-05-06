"use client";
import React, { useEffect, useState } from "react";
import { Check, Zap, Layers } from "lucide-react";
import Wrapper from "@/components/Wrapper";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  name: string;
  symbol: string;
  price: number;
  icon: React.ReactNode;
  features: PlanFeature[];
  isPopular?: boolean;
}

const Pricing = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [country, setCountry] = useState<string | null>(null);
  useEffect(() => {
    const getClientLocation = async () => {
      const res = await fetch("https://ipinfo.io/json");
      const locationData = await res.json();
      setCountry(locationData.country);
    };
    getClientLocation();
  }, []);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.price === 0) {
      // Handle free plan signup
      router.push("/auth/login");
      return;
    }

    if (!user) {
      router.push("/auth/login");
      return;
    }
  };

  const plans: PricingPlan[] = [
    {
      name: "Free",
      symbol: country === "NP" ? "रु" : "₹",
      price: 0,
      icon: <Layers className="w-6 h-6 text-white" />,
      isPopular: false,
      features: [
        {
          text: "5 Presentations/month ",
        },
        {
          text: "Limited file size uploads",
        },
        {
          text: "Has watermark badge",
        },
        { text: "Generate up to 10 cards/slides" },
        {
          text: "Discord support",
        },
      ],
    },
    {
      name: "Plus",
      symbol: country === "NP" ? "रु" : "$",
      price: country === "NP" ? 350 : 4.99,
      icon: <Zap className="w-6 h-6 text-black" />,
      isPopular: true,
      features: [
        { text: "Unlimited Presentation" },
        { text: "Unlimited file size uploads" },
        { text: "Remove watermark badge" },
        { text: "Generate up to 15 cards/slides" },
        { text: "Priority support" },
      ],
    },
  ];
  return (
    <Wrapper className="sm:w-[90%] xl:w-[80%]">
      <div id="pricing" className="flex flex-col gap-16 py-20">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-switzer font-extrabold">
          Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:w-[80%]  xl:w-[65%] 2xl:w-[60%] mx-auto gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[20px] text-center p-8 border border-[#5141e5] ${
                plan.isPopular ? "bg-[#5141e5] border-[#5141e5]" : "bg-white "
              }`}
            >
              {/* Plan Header */}
              <div
                className={`space-y-4 ${plan.isPopular ? "text-white" : ""}`}
              >
                <div
                  className={` ${
                    plan.isPopular ? "bg-white " : "bg-[#5141e5]"
                  } w-12 h-12 mx-auto rounded-full flex items-center justify-center`}
                >
                  {plan.icon}
                </div>
                <h3 className="text-xl font-satoshi  font-medium">
                  {plan.name}
                </h3>
                <div className="flex font-switzer justify-center font-extrabold items-baseline gap-1">
                  <span className="text-3xl font-extrabold">
                    {plan.symbol} {plan.price}
                  </span>
                  <span
                    className={`font-extrabold ${
                      plan.isPopular ? "text-white" : "text-black"
                    }`}
                  >
                    {country === "NP" && plan.name !== "Free"
                      ? "For 30 Days"
                      : "/month"}
                  </span>
                </div>
                {/* <p className={` font-satoshi font-medium ${plan.isPopular ? 'text-white' : 'text-black'}`}>Billed annually.</p> */}
              </div>
              {/* Features List */}
              <div className="space-y-4 mt-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check
                      className={`w-5 h-5 ${
                        plan.isPopular ? "text-white" : "text-black"
                      }`}
                    />
                    <span
                      className={`text-base font-medium  font-satoshi ${
                        plan.isPopular ? "text-white" : "text-black"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Get Started Button */}
              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-3 font-switzer rounded-[32px] hover:scale-[1.02] transition-all duration-300 mt-8 font-medium ${
                  plan.isPopular
                    ? "bg-white text-[#5141e5]"
                    : "bg-[#5141e5] text-white"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

export default Pricing;
