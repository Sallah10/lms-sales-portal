// src/components/BulkLeadUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Download, AlertCircle } from "lucide-react";

export default function BulkLeadUpload({ salesRepId }: { salesRepId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check if file is CSV
      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setMessage({ type: "error", text: "Please select a CSV file." });
        return;
      }

      setFile(selectedFile);
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !salesRepId) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("salesRepId", salesRepId);

    try {
      // Send CSV to parse
      const parseResponse = await fetch("/api/parse-csv", {
        method: "POST",
        body: formData,
      });

      const result = await parseResponse.json();

      if (!parseResponse.ok) {
        throw new Error(result.error || "Failed to process CSV file");
      }

      setMessage({
        type: "success",
        text: `Successfully processed ${result.count} leads from your CSV file. They have been submitted to the system.`,
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        text:
          error.message ||
          "An error occurred while processing your file. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a template CSV content
    const template = `name,email,phone,address,source,notes
John Doe,john@example.com,+1234567890,123 Business Ave,Website,Interested in partnership
Jane Smith,jane@example.com,+0987654321,456 Corporate Blvd,Referral,Met at conference`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Leads</h2>
        <p className="text-gray-600 mt-1">
          Upload a CSV file with multiple leads
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">
              CS Format Requirements
            </h3>
            <ul className="text-blue-700 text-sm mt-1 list-disc list-inside space-y-1">
              <li>
                File must be in CSV format with columns: name, email, phone,
                address, source, notes
              </li>
              <li>First row should contain headers</li>
              <li>Name, email, phone, and address are required fields</li>
              <li>Download our template to ensure proper formatting</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors mb-6">
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="h-12 w-12 text-gray-400" />

          <div className="text-center">
            <label htmlFor="csv-upload" className="cursor-pointer">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload a file
              </span>
              <span className="text-gray-600"> or drag and drop</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">CSV files only</p>
          </div>

          {file && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mt-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={downloadTemplate}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>

        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Leads
            </>
          )}
        </button>
      </div>
    </div>
  );
}
