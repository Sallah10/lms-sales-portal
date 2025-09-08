// src/app/page.tsx (Sales Portal)
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LeadForm from "@/components/LeaadForm";
import Image from "next/image";
import logo from "../../public/1techlink no bg.png";

type ExtendedSessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
};

type ExtendedSession = {
  user?: ExtendedSessionUser;
};

export default function HomePage() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session || !session.user) {
    redirect("/login");
  }

  if (!session.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Authentication error: User ID not found. Please log in again.
        </div>
      </div>
    );
  }
  console.log("Full session data:", session);
  console.log("User ID from session:", session.user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image src={logo} alt="Company Logo" className="h-10 w-auto" />
            <h1 className="text-lg md:text-3xl  font-bold text-gray-900">
              Lead Input Portal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-700 text-sm md:text-2xl">
              Welcome, {session.user?.name}
            </p>

            <button
              onClick={() => redirect("/api/auth/signout")}
              className="text-gray-500 hover:text-gray-700 text-sm md:text-2xl"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Only render form if we have a user ID */}
        {session.user?.id ? (
          <LeadForm salesUserId={session.user.id} />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">
              Error: Could not get your user ID. Please try logging out and back
              in.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
