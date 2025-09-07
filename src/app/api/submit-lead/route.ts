// src/app/api/submit-lead/route.ts (Sales Portal)
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Forward the request to the Internal System's API with the secret key
    const internalResponse = await fetch(
      `${process.env.INTERNAL_API_URL}/api/external/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY!, // The secret key
        },
        body: JSON.stringify(body),
      }
    );

    const data = await internalResponse.json();

    if (!internalResponse.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to submit to internal system" },
        { status: internalResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
