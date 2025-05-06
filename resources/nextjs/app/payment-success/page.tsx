import PaymentSuccess from "@/components/PaymentSuccess";
import Script from "next/script";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentSuccess />
        <Script>
          {`
  gtag('event', 'conversion', {
      'send_to': 'AW-11502098697/XqQCCJbAw_gZEImy0Owq',
      'value': 250,
      'currency': 'INR',
      'transaction_id': ''
  });
            `}
        </Script>
      </Suspense>
    </div>
  );
};

export default page;
