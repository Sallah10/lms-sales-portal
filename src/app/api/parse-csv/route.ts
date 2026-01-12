// src/app/api/parse-csv/route.ts (FIXED)
import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface CsvRecord {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  service?: string;
  source?: string;
  notes?: string;
  priority?: string;
  assets?: string;
  nextFollowUp?: string;
}

interface ValidLead {
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  source: string;
  notes: string;
  priority: string;
  assets?: string;
  nextFollowUp?: string;
  salesRepId: string;
}

// Improved helper function to normalize column names
function normalizeRecord(record: Record<string, string>): CsvRecord {
  const normalized: Record<string, string> = {};
  const unknownFields: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    const lowerKey = key.toLowerCase().trim();

    // Map various column names to standard fields - ORDER MATTERS!
    // Check for specific column names FIRST, then general keywords

    // NAME/COMPANY MAPPING - Check specific names first
    if (
      lowerKey === "partners name" ||
      lowerKey === "company name" ||
      lowerKey === "business name" ||
      lowerKey.includes("partner name") ||
      (lowerKey.includes("name") && !lowerKey.includes("address"))
    ) {
      normalized.name = value;
    }
    // EMAIL MAPPING
    else if (
      lowerKey === "email address" ||
      lowerKey === "email" ||
      lowerKey.includes("mail")
    ) {
      normalized.email = value;
    }
    // ADDRESS MAPPING - Be specific about address fields
    else if (
      lowerKey === "business address" ||
      lowerKey === "address" ||
      lowerKey === "physical address" ||
      (lowerKey.includes("address") && !lowerKey.includes("name"))
    ) {
      normalized.address = value;
    }
    // PHONE MAPPING
    else if (
      lowerKey === "phone number" ||
      lowerKey === "phone" ||
      lowerKey.includes("tel") ||
      lowerKey.includes("mobile") ||
      lowerKey.includes("contact")
    ) {
      normalized.phone = value;
    }
    // SERVICE MAPPING
    else if (
      lowerKey === "service type" ||
      lowerKey === "service" ||
      lowerKey.includes("product") ||
      lowerKey.includes("module") ||
      lowerKey.includes("industry") ||
      lowerKey.includes("category")
    ) {
      normalized.service = value;
    }
    // SOURCE MAPPING
    else if (
      lowerKey === "lead source" ||
      lowerKey === "source" ||
      lowerKey.includes("origin") ||
      lowerKey.includes("referral") ||
      lowerKey.includes("campaign")
    ) {
      normalized.source = value;
    }
    // NOTES MAPPING
    else if (
      lowerKey === "additional notes" ||
      lowerKey === "notes" ||
      lowerKey.includes("comment") ||
      lowerKey.includes("remark") ||
      lowerKey.includes("description")
    ) {
      normalized.notes = value;
    }
    // PRIORITY MAPPING
    else if (
      lowerKey === "priority level" ||
      lowerKey === "priority" ||
      lowerKey.includes("urgent")
    ) {
      normalized.priority = value;
    }
    // NEXT FOLLOW-UP MAPPING
    else if (
      lowerKey === "next follow-up date" ||
      lowerKey === "next follow-up" ||
      lowerKey.includes("follow") ||
      (lowerKey.includes("next") && lowerKey.includes("date"))
    ) {
      normalized.nextFollowUp = value;
    }
    // ASSETS MAPPING
    else if (
      lowerKey === "assets" ||
      lowerKey === "assets/equipment" ||
      lowerKey.includes("equipment") ||
      lowerKey.includes("vehicle") ||
      lowerKey.includes("fleet") ||
      lowerKey.includes("inventory")
    ) {
      normalized.assets = value;
    } else {
      // For unknown fields, collect them to add later with proper tagging
      if (value && value.trim() !== "") {
        unknownFields.push(`${key}: ${value}`);
      }
    }
  }

  // Add unknown fields to notes with proper tagging and spacing
  if (unknownFields.length > 0) {
    const unknownFieldsSection = `\n\n--- UNKNOWN FIELDS ---\n${unknownFields.join(
      "\n"
    )}`;

    if (normalized.notes) {
      // If there are existing notes, append the unknown fields section
      normalized.notes += unknownFieldsSection;
    } else {
      // If no existing notes, create notes with just the unknown fields
      normalized.notes = unknownFieldsSection;
    }
  }

  return normalized as CsvRecord;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const salesRepId = formData.get("salesRepId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!salesRepId) {
      return NextResponse.json(
        { error: "Sales rep ID is required" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 }
      );
    }

    // Read and parse the CSV file
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString("utf-8");

    let records: Record<string, string>[];
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
      });
    } catch (parseError) {
      console.error("CSV parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid CSV format. Please check your file structure." },
        { status: 400 }
      );
    }

    // Validate records
    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "CSV file is empty or contains no data" },
        { status: 400 }
      );
    }

    console.log("Raw CSV records:", records); // DEBUG

    // Validate required fields in each record
    const validLeads: ValidLead[] = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const rawRecord = records[i];
      const rowNumber = i + 2;

      console.log(`Row ${rowNumber} raw:`, rawRecord); // DEBUG

      const record = normalizeRecord(rawRecord);

      console.log(`Row ${rowNumber} normalized:`, record); // DEBUG

      // Check required fields
      if (!record.name) {
        errors.push(`Row ${rowNumber}: Missing required field 'name'`);
        continue;
      }

      if (!record.email) {
        errors.push(`Row ${rowNumber}: Missing required field 'email'`);
        continue;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format '${record.email}'`);
        continue;
      }

      validLeads.push({
        name: record.name || "",
        email: record.email || "",
        phone: record.phone || "",
        address: record.address || "",
        service: record.service || "",
        source: record.source || "CSV Import",
        notes: record.notes || "",
        priority: record.priority || "MEDIUM",
        assets: record.assets || "",
        nextFollowUp: record.nextFollowUp,
        salesRepId: salesRepId,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: `Found ${errors.length} validation error(s)`,
          details: errors,
          validCount: validLeads.length,
          totalCount: records.length,
        },
        { status: 400 }
      );
    }

    // Forward valid leads to the internal system
    const internalResponse = await fetch(
      `${process.env.INTERNAL_API_URL}/api/external/leads/bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({
          leads: validLeads,
          salesRepId,
          salesUserEmail: session.user.email,
        }),
      }
    );

    if (!internalResponse.ok) {
      const errorText = await internalResponse.text();
      console.error("Internal system error response:", errorText);
      throw new Error(
        `Internal system error: ${internalResponse.status} ${errorText}`
      );
    }

    const result = await internalResponse.json();

    return NextResponse.json({
      message: "Leads processed successfully",
      count: validLeads.length,
      details: result,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to process CSV file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
