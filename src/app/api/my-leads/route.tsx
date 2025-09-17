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

    // Construct the URL for clarity and logging
    const internalApiUrl = `${
      process.env.INTERNAL_API_URL
    }/api/external/leads?userId=${
      session.user.id
    }&userEmail=${encodeURIComponent(session.user.email!)}`; // <- Added userEmail
    console.log("🔄 [Sales Portal] Proxying request to Internal System:");
    console.log("   URL:", internalApiUrl);
    console.log("   User ID:", session.user.id);
    console.log("   User Email:", session.user.email); // <- Log email too
    console.log("   API Key Present:", !!process.env.INTERNAL_API_KEY);

    const internalResponse = await fetch(internalApiUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_API_KEY || "",
      },
    });

    console.log(
      "📨 [Sales Portal] Internal System Response Status:",
      internalResponse.status
    );

    // If the internal request failed, get the error message and forward it
    if (!internalResponse.ok) {
      // Try to get the error message from the response
      let errorMessage = `Internal system error: ${internalResponse.status}`;
      try {
        const errorData = await internalResponse.json();
        errorMessage = errorData.error || errorMessage;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // If response isn't JSON, use the status text
        errorMessage = internalResponse.statusText || errorMessage;
      }

      console.error("❌ [Sales Portal] Internal System Error:", errorMessage);
      return new NextResponse(errorMessage, {
        status: internalResponse.status,
      });
    }

    // If successful, pass through the JSON data
    const data = await internalResponse.json();
    console.log(
      "✅ [Sales Portal] Successfully fetched",
      data.leads?.length,
      "leads"
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "💥 [Sales Portal] Unexpected Error in /api/my-leads proxy:",
      error
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
