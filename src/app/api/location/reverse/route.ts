import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyACGz00EpH4dPQ2a0sL0XiMbI20GBCesWg";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    geocodeUrl.searchParams.set("latlng", `${lat},${lng}`);
    geocodeUrl.searchParams.set("key", GOOGLE_MAPS_API_KEY);

    const res = await fetch(geocodeUrl.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding request failed" }, { status: res.status });
    }

    const data = await res.json();
    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json(
        {
          name: "Pinned Location",
          formattedAddress: `${Number(lat).toFixed(4)}°, ${Number(lng).toFixed(4)}°`,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          location: { lat: Number(lat), lng: Number(lng) },
        },
        { status: 200 }
      );
    }

    const first = data.results[0];
    const placeName =
      first.address_components?.[0]?.long_name ||
      first.formatted_address.split(",")[0] ||
      "Selected Location";

    return NextResponse.json({
      name: placeName,
      formattedAddress: first.formatted_address,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      location: {
        lat: first.geometry?.location?.lat ?? Number(lat),
        lng: first.geometry?.location?.lng ?? Number(lng),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
