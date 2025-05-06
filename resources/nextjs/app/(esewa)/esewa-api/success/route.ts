import { NextResponse } from "next/server";
import { generateHmacSha256Hash } from "../../utils";
import { manageEsewaPaymentSuccess } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/utils/supabase/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("data");

    let transactionData: any = Buffer.from(token!, "base64").toString("utf-8");
    transactionData = await JSON.parse(transactionData);
    const signedFieldArray = transactionData.signed_field_names.split(",");
    const signature = transactionData.signature;

    const signatureString = signedFieldArray
      .map((field: any) => `${field}=${transactionData[field]}`)
      .join(",");
    const sign = generateHmacSha256Hash(
      signatureString,
      process.env.ESEWA_SECRET
    );
    if (sign === signature) {
      console.log("success");
      const supabase = await createClient();
      const user = await getUser(supabase);
      await manageEsewaPaymentSuccess(user?.id!);
    } else {
      console.log("failure");
      return NextResponse.redirect(process.env.NEXT_PUBLIC_ESEWA_FAILURE_URL!);
    }
    return NextResponse.redirect(
      process.env.NEXT_PUBLIC_ESEWA_SUCCESS_PAGE_URL!
    );
  } catch (error) {
    console.error("Error at success route", error);
    return NextResponse.redirect(process.env.NEXT_PUBLIC_ESEWA_FAILURE_URL!);
  }
}
