// src/components/LeadForm.tsx (Improved)
"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Send,
  Building,
  AlertCircle,
} from "lucide-react";

//  available services/modules
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

export default function LeadForm({
  salesUserId,
  salesUserEmail,
}: {
  salesUserId: string;
  salesUserEmail?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    notes: "",
    address: "",
    service: "",
    priority: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!salesUserId) {
      setMessage({
        type: "error",
        text: "Authentication error. Please log in again.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { ...form, salesUserId, salesUserEmail };

      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        data = { error: await res.text() };
      }

      if (res.ok) {
        setMessage({ type: "success", text: "Lead submitted successfully!" });
        setForm({
          name: "",
          email: "",
          phone: "",
          source: "",
          notes: "",
          address: "",
          service: "",
          priority: "MEDIUM",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to submit lead",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
      console.error("Error submitting lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Submit a New Lead</h2>
        <p className="text-gray-600 mt-1">
          Enter the details of your potential partner
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <User className="h-4 w-4 mr-2" />
              Company/Partner Name *
            </label>
            <input
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter company/partner name"
            />
          </div>
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="email@company.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Phone *
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              required
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          {/* Service/Module Field */}
          <div className="space-y-2">
            <label
              htmlFor="service"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <Building className="h-4 w-4 mr-2" />
              Service/Module *
            </label>
            <select
              id="service"
              name="service"
              required
              value={form.service}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Select a service</option>
              {AVAILABLE_SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Field */}
          <div className="space-y-2">
            <label
              htmlFor="priority"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Priority *
            </label>
            <select
              id="priority"
              name="priority"
              required
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="source"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <Globe className="h-4 w-4 mr-2" />
              Source
            </label>
            <input
              id="source"
              name="source"
              value={form.source}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="How did you find this lead?"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="address"
            className="flex items-center text-sm font-medium text-gray-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Address *
          </label>
          <input
            id="address"
            name="address"
            required
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Full business address"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="flex items-center text-sm font-medium text-gray-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={form.notes}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Additional information about this lead..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Lead
            </>
          )}
        </button>
      </form>
    </div>
  );
}
