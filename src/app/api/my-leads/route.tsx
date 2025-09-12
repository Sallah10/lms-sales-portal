// lms-sales-portal/src/app/api/my-leads/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Call the INTERNAL system's API to get leads for this sales rep
    const internalResponse = await fetch(
      `${process.env.INTERNAL_API_URL}/api/leads?myLeads=true`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
      }
    );

    if (!internalResponse.ok) {
      throw new Error("Failed to fetch leads from internal system");
    }

    const data = await internalResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error fetching leads:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}