// src/app/api/submit-lead/route.ts (Sales Portal)
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // accept either { payload: {...} } or a raw body and log for debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const forwardBody = (body && (body.payload ?? body)) as any;
    console.log("submit-lead proxy received:", body);
    console.log("submit-lead proxy forwarding:", forwardBody);

    // Forward the request to the Internal System's API with the secret key
    const internalResponse = await fetch(
      `${process.env.INTERNAL_API_URL}/api/external/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY!, // The secret key
        },
        body: JSON.stringify(forwardBody),
      }
    );

    // Checks if response is JSON first
    const contentType = internalResponse.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      data = await internalResponse.json();
      console.log("internal response JSON:", data);
    } else {
      const text = await internalResponse.text();
      console.log(
        "internal response text:",
        text,
        "status:",
        internalResponse.status
      );
      return NextResponse.json(
        { error: text || "Failed to submit lead" },
        { status: internalResponse.status }
      );
    }

    if (!internalResponse.ok) {
      console.error(
        "Internal API returned error:",
        internalResponse.status,
        data
      );
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
