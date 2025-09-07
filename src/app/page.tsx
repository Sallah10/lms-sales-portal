// src/app/page.tsx (Sales Portal)
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LeadForm from "@/components/LeaadForm";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Sales Portal</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-700">Welcome, {session.user?.name}</p>
            <button
              onClick={() => redirect("/api/auth/signout")}
              className="text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <LeadForm salesUserId={(session.user as { id?: string })?.id ?? ""} />
      </main>
    </div>
  );
}
