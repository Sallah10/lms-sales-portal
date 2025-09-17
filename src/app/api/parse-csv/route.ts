// src/app/api/parse-csv/route.ts (FIXED)
import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

interface CsvRecord {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: string;
  notes?: string;
  // Allow for common column name variations
  company?: string;
  contact?: string;
  "company name"?: string;
  "contact name"?: string;
  "phone number"?: string;
  "email address"?: string;
}

interface ValidLead {
  name: string;
  email: string;
  phone: string;
  address: string;
  source: string;
  notes: string;
  salesRepId: string;
}

// Helper function to normalize column names
function normalizeRecord(record: CsvRecord): CsvRecord {
  const normalized: CsvRecord = {};

  for (const [key, value] of Object.entries(record)) {
    const lowerKey = key.toLowerCase().trim();

    if (
      lowerKey.includes("name") ||
      lowerKey.includes("company") ||
      lowerKey.includes("contact")
    ) {
      normalized.name = value || normalized.name;
    } else if (lowerKey.includes("email")) {
      normalized.email = value || normalized.email;
    } else if (lowerKey.includes("phone") || lowerKey.includes("tel")) {
      normalized.phone = value || normalized.phone;
    } else if (lowerKey.includes("address") || lowerKey.includes("location")) {
      normalized.address = value || normalized.address;
    } else if (lowerKey.includes("source") || lowerKey.includes("origin")) {
      normalized.source = value || normalized.source;
    } else if (lowerKey.includes("note") || lowerKey.includes("comment")) {
      normalized.notes = value || normalized.notes;
    } else {
      // Keep original key for unknown fields
      normalized[key as keyof CsvRecord] = value;
    }
  }

  return normalized;
}

export async function POST(req: NextRequest) {
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

    let records: CsvRecord[];
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

    // Validate required fields in each record
    const validLeads: ValidLead[] = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const rawRecord = records[i];
      const rowNumber = i + 2; // +2 because of header row and 0-based index

      // Normalize the record to handle different column names
      const record = normalizeRecord(rawRecord);

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
        name: record.name,
        email: record.email,
        phone: record.phone || "", // Make phone optional
        address: record.address || "", // Make address optional
        source: record.source || "Bulk Upload",
        notes: record.notes || "",
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
      `${process.env.INTERNAL_API_URL}/api/external/leads/bulk`, // ← Changed to external endpoint
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({
          leads: validLeads,
          salesRepId,
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
