// lms-sales-portal/src/app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const leadId = params.id;

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!leadId) {
      return new NextResponse("Lead ID is required", { status: 400 });
    }

    // Call the INTERNAL system's API to get the specific lead
    const internalApiUrl = `${
      process.env.INTERNAL_API_URL
    }/api/external/leads/${leadId}?userId=${
      session.user.id
    }&userEmail=${encodeURIComponent(session.user.email!)}`;

    console.log(
      "🔄 [Sales Portal] Fetching lead from Internal System:",
      internalApiUrl
    );

    const internalResponse = await fetch(internalApiUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_API_KEY || "",
      },
    });

    if (!internalResponse.ok) {
      const errorText = await internalResponse.text();
      console.error("❌ Internal System Error:", errorText);
      return new NextResponse(
        `Failed to fetch lead from internal system: ${internalResponse.status}`,
        { status: internalResponse.status }
      );
    }

    const data = await internalResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 Error in /api/leads/[id]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const leadId = params.id;
    const body = await request.json();

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!leadId) {
      return new NextResponse("Lead ID is required", { status: 400 });
    }

    // Extract only allowed fields for sales reps to edit
    const { phone, address, service, notes, priority, nextFollowUp } = body;

    // Call the INTERNAL system's API to update the lead
    const internalApiUrl = `${process.env.INTERNAL_API_URL}/api/external/leads/${leadId}`;

    console.log(
      "🔄 [Sales Portal] Updating lead via Internal System:",
      internalApiUrl
    );

    const internalResponse = await fetch(internalApiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_API_KEY || "",
      },
      body: JSON.stringify({
        phone,
        address,
        service,
        notes,
        priority,
        nextFollowUp,
        userId: session.user.id,
        userEmail: session.user.email,
      }),
    });

    if (!internalResponse.ok) {
      const errorText = await internalResponse.text();
      console.error("❌ Internal System Error:", errorText);
      return new NextResponse(
        `Failed to update lead in internal system: ${internalResponse.status}`,
        { status: internalResponse.status }
      );
    }

    const data = await internalResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 Error in PATCH /api/leads/[id]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
