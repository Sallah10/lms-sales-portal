// src/app/api/parse-csv/route.ts (External Portal)
import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

interface CsvRecord {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: string;
  notes?: string;
}

// Define the structure of a validated lead
interface ValidLead {
  name: string;
  email: string;
  phone: string;
  address: string;
  source: string;
  notes: string;
  salesRepId: string;
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

    // Read and parse the CSV file
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString("utf-8");

    let records: CsvRecord[];
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (parseError) {
      console.error("CSV parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid CSV format" },
        { status: 400 }
      );
    }

    // Validate records
    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "CSV file is empty or invalid" },
        { status: 400 }
      );
    }

    // Validate required fields in each record
    const validLeads: ValidLead[] = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // +2 because of header row and 0-based index

      if (!record.name || !record.email || !record.phone || !record.address) {
        errors.push(
          `Row ${rowNumber}: Missing required fields (name, email, phone, or address)`
        );
        continue;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`);
        continue;
      }

      validLeads.push({
        name: record.name,
        email: record.email,
        phone: record.phone,
        address: record.address,
        source: record.source || "Bulk Upload",
        notes: record.notes || "",
        salesRepId: salesRepId,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation errors found",
          details: errors,
          validCount: validLeads.length,
        },
        { status: 400 }
      );
    }

    // Forward valid leads to the internal system
    const internalResponse = await fetch(
      `${process.env.INTERNAL_API_URL}/api/leads/bulk`,
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
      throw new Error(`Internal system error: ${errorText}`);
    }

    return NextResponse.json({
      message: "Leads processed successfully",
      count: validLeads.length,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { error: "Failed to process CSV file" },
      { status: 500 }
    );
  }
}
