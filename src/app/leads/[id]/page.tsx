// lms-sales-portal/src/app/leads/[id]/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Calendar,
  User,
  Briefcase,
  AlertCircle,
  Edit,
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
  updatedAt: string;
  notes?: string;
  assets?: string;
}

export default function LeadDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error("Error fetching lead:", err);
      toast.error("Failed to load lead details. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <div className="flex flex-col gap-4 md:gap-0 md:flex-row items-center justify-between">
            <div className="flex  items-center gap-4">
              <Link href="/my-leads">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to My Leads
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Lead Details
                </h1>
                <p className="text-gray-600">Viewing lead information</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/leads/${leadId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Lead
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
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

                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-900">{lead.phone}</p>
                    </div>
                  </div>
                )}

                {lead.service && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Service
                      </p>
                      <p className="text-gray-900">{lead.service}</p>
                    </div>
                  </div>
                )}

                {lead.source && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Source
                      </p>
                      <p className="text-gray-900">{lead.source}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Priority
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.priority === "HIGH"
                          ? "bg-red-100 text-red-800"
                          : lead.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {lead.priority}
                    </span>
                  </div>
                </div>

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

          {/* Address & Assets Card */}
          <Card>
            <CardHeader>
              <CardTitle>Location & Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-gray-900">{lead.address}</p>
                  </div>
                </div>
              )}

              {lead.assets && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Assets / Investment Capacity
                    </p>
                    <p className="text-gray-900">{lead.assets}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes & Follow-up Card */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {lead.notes}
                    </p>
                  </div>
                </div>
              )}

              {lead.nextFollowUp && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Next Follow-up
                    </p>
                    <p className="text-gray-900">
                      {new Date(lead.nextFollowUp).toLocaleDateString()} at{" "}
                      {new Date(lead.nextFollowUp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-gray-900">
                    {new Date(lead.createdAt).toLocaleDateString()} at{" "}
                    {new Date(lead.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {lead.updatedAt !== lead.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Last Updated
                    </p>
                    <p className="text-gray-900">
                      {new Date(lead.updatedAt).toLocaleDateString()} at{" "}
                      {new Date(lead.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
