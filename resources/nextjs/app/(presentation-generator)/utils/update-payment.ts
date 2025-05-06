import { MixpanelEventName } from "@/utils/mixpanel/enums";
import { sendMpEvent } from "@/utils/mixpanel/services";
import { getStripe } from "@/utils/stripe/client";
import { checkoutWithStripe } from "@/utils/stripe/server";
const PRICE_ID = "price_1RH1LSJwD2RujMHB6l7rVnUI";
export const handlePayment = async () => {
  const res = await fetch("https://ipinfo.io/json");
  const locationData = await res.json();
  if (locationData.country === "NP") {
    try {
      const response = await fetch("/esewa-api/esewa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: {
            amount: "350.00",
            productId: `PRD${Date.now()}`,
          },
        }),
      });

      const data = await response.json();
      console.log("data", data);
      callEsewa(data.data);
      if (!response.ok) {
        throw new Error(data.error || "Payment initiation failed");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      // Add user-friendly error handling here
    }
  } else {
    // ? Upgrade click
    sendMpEvent(MixpanelEventName.upgradePlanClicked);
    const { sessionId, errorRedirect } = await checkoutWithStripe({
      price: PRICE_ID,
      priceType: "month",
    });
    sendMpEvent(MixpanelEventName.stripeCheckoutSessionCreated, {
      session_id: sessionId!,
      price: PRICE_ID,
      price_type: "month",
    });

    if (errorRedirect) {
      sendMpEvent(MixpanelEventName.error, {
        error_message: "Error redirecting to Stripe",
      });
      sendMpEvent(MixpanelEventName.error, {
        error_message: errorRedirect,
      });
      return;
    }

    if (!sessionId) {
      sendMpEvent(MixpanelEventName.error, {
        error_message: "Failed to create checkout session",
      });
      throw new Error("Failed to create checkout session");
    }

    const stripe = await getStripe();
    if (!stripe) {
      sendMpEvent(MixpanelEventName.error, {
        error_message: "Failed to load Stripe",
      });
      throw new Error("Failed to load Stripe");
    }

    sendMpEvent(MixpanelEventName.redirectToStripe);

    await stripe.redirectToCheckout({ sessionId });
  }
};

const callEsewa = async (data: any) => {
  // console.log("data is", data);
  console.log(process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL);
  const form = document.createElement("form");
  form.setAttribute("method", "POST");
  form.setAttribute("action", process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL!);
  for (const key in data) {
    const ele = document.createElement("input");
    ele.setAttribute("type", "text");
    ele.setAttribute("name", key);
    ele.setAttribute("value", data[key]);
    ele.style.display = "none";
    form.appendChild(ele);
  }
  document.body.appendChild(form);
  form.submit();
};
