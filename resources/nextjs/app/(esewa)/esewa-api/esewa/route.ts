import { NextResponse } from "next/server";
import { generateHmacSha256Hash } from "../../utils";

export async function POST(request: Request) {
  try {
    const { body } = await request.json();
    const { amount, productId } = body;

    if (!amount || !productId) {
      return NextResponse.json(
        { error: "Amount and productId are required" },
        { status: 400 }
      );
    }

    const paymentData = {
      amount: amount.toString(),
      failure_url: process.env.NEXT_PUBLIC_ESEWA_FAILURE_URL,
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: process.env.MERCHANT_KEY,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: process.env.NEXT_PUBLIC_ESEWA_SUCCESS_URL,
      tax_amount: "0",
      total_amount: amount.toString(),
      transaction_uuid: productId,
    };

    // Generate signature
    const signatureString = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = generateHmacSha256Hash(
      signatureString,
      process.env.ESEWA_SECRET
    );
    const finalPaymentData = {
      ...paymentData,
      signature,
    };

    return NextResponse.json({
      data: finalPaymentData,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
