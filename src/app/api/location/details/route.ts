import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyACGz00EpH4dPQ2a0sL0XiMbI20GBCesWg";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = (searchParams.get("placeId") || "").trim();

    if (!placeId) {
      return NextResponse.json({ error: "placeId is required" }, { status: 400 });
    }

    const googleUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    googleUrl.searchParams.set("place_id", placeId);
    googleUrl.searchParams.set("fields", "name,formatted_address,geometry,url,vicinity");
    googleUrl.searchParams.set("key", GOOGLE_MAPS_API_KEY);

    const res = await fetch(googleUrl.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch place details" },
        { status: res.status }
      );
    }

    const data = await res.json();
    if (data.status !== "OK") {
      return NextResponse.json(
        { error: data.error_message || data.status || "Google Places API error" },
        { status: 400 }
      );
    }

    const result = data.result || {};
    return NextResponse.json({
      name: result.name || "",
      formattedAddress: result.formatted_address || result.vicinity || "",
      googleMapsUrl:
        result.url ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          (result.name || "") + " " + (result.formatted_address || "")
        )}`,
      location: result.geometry?.location || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
