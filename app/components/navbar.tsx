"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Navbar() {
  const [user, setUser] = useState<any>(undefined); 
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      try {
        const res = await axios.get("/api/me", { withCredentials: true });
        if (!mounted) return;
        setUser(res.data.user || null);
      } catch (err) {
        console.error(err);
        if (mounted) setUser(null);
      }
    }
    fetchUser();
    return () => { mounted = false; };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }
  const rightSide = (() => {
    if (user === undefined) {
      return (
        <div className="flex items-center gap-4">
          <span style={{ width: 120, height: 16 }} className="bg-gray-600 rounded block" />
          <button className="bg-gray-600 px-3 py-1 rounded font-medium text-white" disabled>
            ...
          </button>
        </div>
      );
    }
    if (user === null) {
      return (
        <button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-medium text-white">
          Login
        </button>
      );
    }
    return (
      <div className="space-x-4">
        <span className="text-gray-300">Hey, {user.username}</span>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-medium text-white">
          Logout
        </button>
      </div>
    );
  })();

  return (
    <nav className="w-full bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold cursor-pointer" onClick={() => router.push("/dashboard")}>Devstream</h1>
      {rightSide}
    </nav>
  );
}
