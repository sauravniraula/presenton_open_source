import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get credentials from environment variables
    const apiKey = process.env.DID_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing D-ID API key" },
        { status: 500 }
      );
    }

    // Get clip_id from URL
    const { searchParams } = new URL(request.url);
    const clipId = searchParams.get("clip_id");

    if (!clipId) {
      return NextResponse.json(
        { error: "Missing clip_id parameter" },
        { status: 400 }
      );
    }

    // Make request to D-ID API
    const response = await fetch(`https://api.d-id.com/clips/${clipId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to fetch clip status", details: errorData },
        { status: response.status }
      );
    }

    // Return the raw response data
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching clip status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
