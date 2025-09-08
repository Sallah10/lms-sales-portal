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

    // Checks if response is JSON first
    const contentType = internalResponse.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      data = await internalResponse.json();
    } else {
      // If it's not JSON, get the text instead
      const text = await internalResponse.text();
      return NextResponse.json(
        { error: text || "Failed to submit lead" },
        { status: internalResponse.status }
      );
    }

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
