import { initializeNewUser } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, email } = body;

    if (!user_id || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // Initialize the user
    const result = await initializeNewUser(user_id, email);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to initialize user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error initializing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
