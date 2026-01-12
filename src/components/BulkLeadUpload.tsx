// src/components/BulkLeadUpload.tsx
"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { showToast } from "../lib/toast"; // Add toast support

interface ImportResult {
  success: boolean;
  message: string;
  count?: number;
  importedCount?: number;
  errorCount?: number;
  duplicatesCount?: number;
  errors?: string[];
  duplicates?: Array<{
    email: string;
    name: string;
    existingOwner: string;
  }>;
}

export default function BulkLeadUpload({ salesRepId }: { salesRepId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        showToast.error("Please select a CSV file.");
        return;
      }

      setFile(selectedFile);
      setResult(null);
      setShowWarning(true);
    }
  };

  const handleConfirmImport = async () => {
    if (!file || !salesRepId) return;

    setIsLoading(true);
    setShowWarning(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("salesRepId", salesRepId);

    try {
      const parseResponse = await fetch("/api/parse-csv", {
        method: "POST",
        body: formData,
      });

      const result = await parseResponse.json();

      if (parseResponse.ok) {
        setResult({
          success: true,
          message: result.message || "Leads processed successfully",
          importedCount: result.count || result.importedCount || 0,
          errorCount: 0,
          duplicatesCount: result.duplicatesCount,
          duplicates: result.duplicates,
        });
        showToast.success(
          `Successfully processed ${result.count || result.importedCount} leads`
        );
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setResult({
          success: false,
          message: result.error || "Failed to process CSV file",
          importedCount: 0,
          errorCount: result.errorCount || 0,
          errors: result.errors || result.details,
          duplicatesCount: result.duplicatesCount,
          duplicates: result.duplicates,
        });
        showToast.error(result.error || "Failed to process CSV file");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Upload error:", error);
      setResult({
        success: false,
        message:
          error.message || "An error occurred while processing your file",
        importedCount: 0,
        errorCount: 0,
      });
      showToast.error("Network error during upload");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelWarning = () => {
    setShowWarning(false);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const template = `Partners Name,Email Address,Phone Number,Business Address,Service Type,Lead Source,Priority Level,Additional Notes,Assets/Equipment,Next Follow-up Date
Acme Inc,acme@example.com,+1234567890,123 Business Rd,Logistics - Trucking,Website,HIGH,Interested in fleet management,"5 Trucks, 2 Vans",2024-01-15
Global Corp,global@example.com,+0987654321,456 Corporate Ave,Food & Beverages,Referral,MEDIUM,Looking for cold chain logistics,Refrigerated Trucks,2024-01-20
Tech Solutions,tech@example.com,+1122334455,789 Tech Park,Healthcare,Google Ads,LOW,Need medical equipment transport,Medical Devices,2024-01-25`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_import_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Leads</h2>
        <p className="text-gray-600 mt-1">
          Upload a CSV file with multiple leads
        </p>
      </div>

      {/* Results Display */}
      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  result.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {result.message}
              </p>

              {result.importedCount && result.importedCount > 0 && (
                <p className="text-sm text-green-700 mt-1">
                  Successfully processed: {result.importedCount} leads
                </p>
              )}

              {result.duplicatesCount !== undefined &&
                result.duplicatesCount > 0 && (
                  <p className="text-sm text-orange-700 mt-1">
                    Duplicates detected: {result.duplicatesCount} leads
                  </p>
                )}

              {result.errorCount && result.errorCount > 0 && (
                <p className="text-sm text-red-700 mt-1">
                  Errors: {result.errorCount} records
                </p>
              )}

              {/* Show duplicate details */}
              {result.duplicates && result.duplicates.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-orange-800 mb-2">
                    Duplicate leads found:
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {result.duplicates.slice(0, 5).map((dup, index) => (
                      <div
                        key={index}
                        className="text-sm text-orange-700 p-2 bg-orange-100 rounded"
                      >
                        <strong>{dup.name}</strong> ({dup.email}) - Already
                        exists in system
                      </div>
                    ))}
                    {result.duplicates.length > 5 && (
                      <p className="text-xs text-orange-600">
                        ...and {result.duplicates.length - 5} more duplicates
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Show error details */}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    Error details:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li className="text-xs text-red-600">
                        • ...and {result.errors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Format Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">
              CSV Format Requirements
            </h3>
            <ul className="text-blue-700 text-sm mt-1 space-y-1">
              <li>
                • <strong>Required:</strong> Name/Company and Email fields
              </li>
              <li>
                • <strong>Supported modules:</strong> Logistics, Food & Drinks,
                Chat with Doctor, etc.
              </li>
              <li>
                • <strong>Flexible column names:</strong> &quot;Name&quot;,
                &quot;Company&quot;, &quot;Email&quot;, &quot;Phone&quot;, etc.
              </li>
              <li>
                • <strong>Assets column:</strong> For logistics (trucks,
                equipment, fleet details)
              </li>
              <li>
                • <strong>Priority values:</strong> HIGH, MEDIUM, LOW
              </li>
              <li>
                • <strong>Date format:</strong> YYYY-MM-DD or MM/DD/YYYY
              </li>
              <li>• Duplicate emails will be detected and skipped</li>
              <li>• Unknown columns will be added to notes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileSelect}
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
            <p className="text-xs text-gray-500 mt-1">
              CSV files only, up to 10MB
            </p>
          </div>

          {file && !showWarning && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mt-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                onClick={handleCancelWarning}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={downloadTemplate}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>

        <button
          onClick={() => setShowWarning(true)}
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

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold">Confirm Import</h3>
            </div>

            <p className="text-gray-600 mb-4">
              You are about to import <strong>{file?.name}</strong>. Please
              ensure:
            </p>

            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>• Required fields (Name, Email) are present</li>
              <li>• Email formats are correct</li>
              <li>• No duplicate records exist</li>
              <li>• Date formats are consistent (YYYY-MM-DD)</li>
              <li>• File size is under 10MB</li>
            </ul>

            <div className="flex gap-3">
              <Button
                onClick={handleCancelWarning}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmImport}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Importing..." : "Confirm Import"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Button component if not available
function Button({
  children,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "outline";
  className?: string;
  disabled?: boolean;
}) {
  const baseStyles =
    "flex items-center justify-center px-4 py-2 rounded-lg transition-colors font-medium";
  const variantStyles =
    variant === "outline"
      ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
}
