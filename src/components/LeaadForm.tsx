// src/components/LeadForm.tsx (Sales Portal)
"use client";

import { useState } from "react";

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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  console.log("Sales User ID in LeadForm:", salesUserId);

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
      // include salesUserEmail as a fallback identifier for the internal system
      const payload = { ...form, salesUserId, salesUserEmail };
      console.log("Sending payload:", payload);

      // This calls the Portal's API route, which will forward to the Internal System
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // send the payload at the top level (internal API expects name,email,salesUserId at root)
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
        }); // Reset form
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Submit a New Lead
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name *
            </label>
            <input
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone*
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              required
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address*
            </label>
            <input
              id="address"
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-700"
            >
              Source
            </label>
            <input
              id="source"
              name="source"
              value={form.source}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Lead"}
          </button>
        </form>
      </div>
    </div>
  );
}
