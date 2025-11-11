"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function useRequireAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const res = await axios.get("/api/me", { withCredentials: true });
        if (!mounted) return;

        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("auth check failed:", err);
        router.replace("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  return { user, loading };
}
