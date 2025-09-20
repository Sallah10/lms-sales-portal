// lms-sales-portal/src/app/api/leads/[id]/notes/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const leadId = (await params).id;
    const { notes } = await request.json();

    // Call internal API to update notes
    const internalResponse = await fetch(
      `${process.env.INTERNAL_API_URL}/api/leads/${leadId}/notes`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({
          notes,
          userId: session.user.id,
        }),
      }
    );

    if (!internalResponse.ok) {
      throw new Error("Failed to update notes in internal system");
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error updating notes:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
