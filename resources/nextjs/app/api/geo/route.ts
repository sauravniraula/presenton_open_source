// app/api/geo/route.ts (or /pages/api/geo.ts if using pages directory)
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.ip || "8.8.8.8";

  const res = await fetch(`https://ipapi.co/${ip}/json/`);
  const geoData = await res.json();

  return Response.json(geoData);
}
