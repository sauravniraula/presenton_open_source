import { NextResponse } from "next/server";

interface RequestBody {
  presenter_id: string;
  audio_url: string;
  background_color?: boolean;
}

interface DIDRequest {
  presenter_id: string;
  script: {
    type: "audio";
    audio_url: string;
  };
  background: {
    color: boolean;
  };
  config: {
    result_format: "webm";
  };
  persist: boolean;
}

export async function POST(request: Request) {
  try {
    // Get credentials from environment variables
    const apiKey = process.env.DID_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing D-ID API key" },
        { status: 500 }
      );
    }

    // Parse request body
    const body: RequestBody = await request.json();
    console.log("body of create avatar", body);
    const { presenter_id, audio_url, background_color = false } = body;

    // Prepare request for D-ID API
    const didRequest: DIDRequest = {
      presenter_id,
      script: {
        type: "audio",
        audio_url,
      },
      background: {
        color: background_color,
      },
      config: {
        result_format: "webm",
      },
      persist: false
    };

    // Make request to D-ID API
    const response = await fetch("https://api.d-id.com/clips", {
      method: "POST",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(didRequest),
    });

    console.log("response of create avatar", response);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to create avatar clip", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error creating avatar clip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 