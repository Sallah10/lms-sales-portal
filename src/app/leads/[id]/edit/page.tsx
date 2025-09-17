// lms-sales-portal/src/app/leads/[id]/edit/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  User,
  Briefcase,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  service?: string;
  source?: string;
  status?: {
    id: string;
    name: string;
  };
  priority: string;
  nextFollowUp?: string;
  createdAt: string;
  notes?: string;
  assets?: string;
}

// Available services/modules (same as in your LeadForm)
const AVAILABLE_SERVICES = [
  "Chat with a doctor",
  "Chat with a lawyer",
  "Open Market",
  "Pharmacies",
  "Logistics",
  "Store",
  "Gadgets and Accessories",
  "Foods & Drinks",
];

export default function EditLeadPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    address: "",
    service: "NONE",
    notes: "",
    priority: "MEDIUM",
    nextFollowUp: "",
  });

  const [lead, setLead] = useState<Lead | null>(null);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    redirect("/login");
  }

  useEffect(() => {
    if (session?.user?.id && leadId) {
      fetchLead();
    }
  }, [session, leadId]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads/${leadId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLead(data.lead);

      // Pre-fill the form with current lead data
      setForm({
        phone: data.lead.phone || "",
        address: data.lead.address || "",
        service: data.lead.service || "NONE",
        notes: data.lead.notes || "",
        priority: data.lead.priority || "MEDIUM",
        nextFollowUp: data.lead.nextFollowUp
          ? new Date(data.lead.nextFollowUp).toISOString().slice(0, 16)
          : "",
      });
    } catch (err) {
      console.error("Error fetching lead:", err);
      toast.error("Failed to load lead details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update lead");
      }

      toast.success("Lead updated successfully!");
      router.push(`/leads/${leadId}`);
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update lead"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Lead Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The requested lead could not be found.
            </p>
            <Button asChild>
              <Link href="/my-leads">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Leads
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/leads/${leadId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lead
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
                <p className="text-gray-600">Updating: {lead.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Read-only Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information (Read-only)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Name</p>
                      <p className="text-gray-900">{lead.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-gray-900">{lead.email}</p>
                    </div>
                  </div>

                  {lead.source && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Source
                        </p>
                        <p className="text-gray-900">{lead.source}</p>
                      </div>
                    </div>
                  )}

                  {lead.status && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Status
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lead.status.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Editable Fields Card */}
            <Card>
              <CardHeader>
                <CardTitle>Editable Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Address Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="address"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Address
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Full business address"
                    />
                  </div>

                  {/* Service Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="service"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Service/Module
                    </label>
                    <Select
                      value={form.service}
                      onValueChange={(value) =>
                        handleSelectChange("service", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>{" "}
                        {/* ← Use a non-empty value */}
                        {AVAILABLE_SERVICES.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="priority"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Priority
                    </label>
                    <Select
                      value={form.priority}
                      onValueChange={(value) =>
                        handleSelectChange("priority", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Next Follow-up Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="nextFollowUp"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Next Follow-up
                    </label>
                    <Input
                      id="nextFollowUp"
                      name="nextFollowUp"
                      type="datetime-local"
                      value={form.nextFollowUp}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Notes Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="notes"
                    className="flex items-center text-sm font-medium text-gray-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Notes
                  </label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={6}
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional information about this lead..."
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/leads/${leadId}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
