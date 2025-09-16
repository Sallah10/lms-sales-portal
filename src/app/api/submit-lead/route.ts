// lms-sales-portal/src/app/api/submit-lead/route.ts - CORRECT LOCATION
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      source,
      notes,
      address,
      service,
      priority,
      salesUserId,
      salesUserEmail,
    } = body;

    // Validate required fields
    if (!name || !email || !salesUserId) {
      return new NextResponse("Name, email, and sales user ID are required", {
        status: 400,
      });
    }

    // Call the INTERNAL system's API to create the lead
    const internalResponse = await fetch(
      `${process.env.INTERNAL_API_URL}/api/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || "",
          source: source || "",
          notes: notes || "",
          address: address || "",
          service: service || "",
          priority: priority || "MEDIUM",
          salesUserId,
          salesUserEmail,
        }),
      }
    );

    if (!internalResponse.ok) {
      const errorText = await internalResponse.text();
      console.error("Internal system error:", errorText);
      return new NextResponse(
        `Failed to create lead in internal system: ${errorText}`,
        { status: internalResponse.status }
      );
    }

    const lead = await internalResponse.json();
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Lead submission error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
