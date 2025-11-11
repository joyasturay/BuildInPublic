"use client";

import useRequireAuth from "../hooks/useRequireAuth";

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return <p className="text-center text-white mt-20">Loading...</p>;
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Hey {user?.username || "Dev"} 👋</h1>
      <p className="text-gray-400 mt-2">Welcome to your DevStream dashboard.</p>
      <a
        href="/"
        className="mt-6 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-semibold"
      >
        Go Live 🚀
      </a>
    </div>
  );
}
