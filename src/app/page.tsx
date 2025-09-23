// src/app/page.tsx (Sales Portal - Improved)
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LeadForm from "@/components/LeaadForm";
import BulkLeadUpload from "@/components/BulkLeadUpload";
import Image from "next/image";
import logo from "../../public/1techlink no bg.png";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  User,
  LogOut,
  Upload,
  UserPlus,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("single");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-600 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-blue-400 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session || !session.user) {
    redirect("/login");
  }

  if (!session.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md mx-4">
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p>User ID not found. Please log in again.</p>
          <button
            onClick={() => redirect("/api/auth/signout")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image
                src={logo}
                alt="Company Logo"
                className="h-10 w-auto md:h-12"
                priority
              />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Lead Portal
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-5 w-5" />
                <span className="font-medium">{session.user?.name}</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Link href="/my-leads">
                  <Button variant="ghost" size="sm">
                    My Leads
                  </Button>
                </Link>
              </div>
              <button
                onClick={() => redirect("/api/auth/signout")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            // bg-black
            className="fixed inset-0 backdrop-blur-sm bg-opacity-25"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Image src={logo} alt="Company Logo" className="h-8 w-auto" />
                <span className="font-semibold">Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {session.user?.name}
                  </p>
                  <p className="text-sm text-gray-600">{session.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/my-leads">
                  <Button variant="ghost" size="sm">
                    My Leads
                  </Button>
                </Link>
              </div>
              <button
                // onClick={() => signOut({ callbackUrl: "/login" })}
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {session.user?.name}!
              </h2>
              <p className="text-gray-600">
                Submit new leads or upload multiple leads at once.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BarChart3 className="h-4 w-4" />
              <span>Sales Representative</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 border">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "single"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <UserPlus className="h-4 w-4 inline mr-2" />
              Single Lead
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "bulk"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {activeTab === "single" && session.user?.id ? (
            <LeadForm
              salesUserId={session.user.id}
              salesUserEmail={session.user?.email ?? undefined}
            />
          ) : activeTab === "bulk" && session.user?.id ? (
            <BulkLeadUpload salesRepId={session.user.id} />
          ) : (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-yellow-800">
                  Error: Could not get your user ID. Please try logging out and
                  back in.
                </p>
                <button
                  onClick={() => redirect("/api/auth/signout")}
                  className="mt-3 text-yellow-800 hover:text-yellow-900 underline text-sm"
                >
                  Sign out now
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} 1TechLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
