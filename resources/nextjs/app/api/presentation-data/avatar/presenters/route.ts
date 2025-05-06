import { NextResponse } from "next/server";

interface Presenter {
  presenter_id: string;
  gender: string;
  name: string;
  image_url: string;
  preview_url: string;
}

interface DIDResponse {
  presenters: Array<{
    presenter_id: string;
    gender: string;
    name: string;
    image_url: string;
    preview_url: string;
    [key: string]: any;  // Allow other properties that we'll filter out
  }>;
}

export async function GET() {
  try {
    // Get credentials from environment variables
    const apiKey = process.env.DID_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing D-ID API key" },
        { status: 500 }
      );
    }

    // Make request to D-ID API
    const response = await fetch("https://api.d-id.com/clips/presenters", {
      method: "GET",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to fetch presenters", details: errorData },
        { status: response.status }
      );
    }

    const data: DIDResponse = await response.json();

    // Filter only the required fields from each presenter
    const filteredPresenters: Presenter[] = data.presenters.map(presenter => ({
      presenter_id: presenter.presenter_id,
      gender: presenter.gender,
      name: presenter.name,
      image_url: presenter.image_url,
      preview_url: presenter.preview_url,
    }));

    return NextResponse.json({ presenters: filteredPresenters });

  } catch (error) {
    console.error("Error fetching presenters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 