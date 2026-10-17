import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyACGz00EpH4dPQ2a0sL0XiMbI20GBCesWg";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const input = (searchParams.get("input") || searchParams.get("query") || "").trim();

    if (!input || input.length < 2) {
      return NextResponse.json({ predictions: [] });
    }

    const googleUrl = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    googleUrl.searchParams.set("input", input);
    googleUrl.searchParams.set("key", GOOGLE_MAPS_API_KEY);

    const res = await fetch(googleUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch location suggestions" },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json(
        { error: data.error_message || data.status || "Google Places API error" },
        { status: 400 }
      );
    }

    const predictions = (data.predictions || []).map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text || p.description,
      secondaryText: p.structured_formatting?.secondary_text || "",
    }));

    return NextResponse.json({ predictions });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
