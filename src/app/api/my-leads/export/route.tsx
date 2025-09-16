// lms-sales-portal/src/app/api/my-leads/export/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Call the INTERNAL system's export API
    const internalResponse = await fetch(
      `${process.env.INTERNAL_API_URL}/api/leads/export?myLeads=true&includeService=true`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
      }
    );

    if (!internalResponse.ok) {
      throw new Error("Failed to export leads from internal system");
    }

    const csvData = await internalResponse.text();

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=my-leads-export.csv`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
