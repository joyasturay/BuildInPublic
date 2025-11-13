"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase"; // your client (anon key)
type User = { id: string; username?: string; bio?: string; profilepic?: string | null };

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || "profile-pics";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: "", bio: "" });
  const [uploading, setUploading] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // sanitize file names
  const sanitizeFileName = (name: string) =>
    name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 120);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch /api/me");
        const json = await res.json();
        const u: User | null = json.user ?? null;

        if (!u) {
          if (mounted) {
            setUser(null);
            setLoadingUser(false);
          }
          return;
        }

        if (mounted) {
          setUser(u);
          setForm({ username: u.username || "", bio: u.bio || "" });
        }

        // server returns `profilepic` (lowercase) so read that
        const pic = u.profilepic ?? null;
        if (mounted) setProfilePic(pic);
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const safeName = sanitizeFileName(file.name);
    const filePath = `${user.id}/${Date.now()}_${safeName}`;

    try {
      // upload to bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw uploadError;
      }

      console.log("Uploaded file path:", filePath, "uploadData:", uploadData);

      // try to get public URL through SDK
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      let finalUrl = urlData?.publicUrl ?? null;

      // If getPublicUrl returned nothing (or you're using a private bucket), fall back
      // to building the standard public URL — this works for public buckets.
      if (!finalUrl) {
        if (!SUPABASE_URL) {
          console.warn("NEXT_PUBLIC_SUPABASE_URL not set — cannot build fallback URL");
        } else {
          // Construct the public URL pattern used by Supabase for public buckets:
          // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
          finalUrl = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(
            filePath
          )}`;
        }
      }

      if (!finalUrl) {
        // We can't create signed URLs from client — inform the user
        throw new Error(
          "Could not determine a public URL for the uploaded file. If your bucket is private, configure server-side signed URLs."
        );
      }

      // Send the finalUrl as `profilepic` to your server (your POST handler expects profilepic)
      const updateRes = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profilepic: finalUrl,
        }),
      });

      const contentType = updateRes.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await updateRes.json();
        if (!updateRes.ok) {
          throw new Error(JSON.stringify(json));
        }
        // server returns updated user object — use that profilepic if present
        const savedUrl: string | undefined = json.user?.profilepic ?? finalUrl;
        setProfilePic(savedUrl ?? finalUrl);
        // update local user object too
        setUser((prev) => (prev ? { ...prev, profilepic: savedUrl ?? finalUrl } : prev));
      } else {
        const text = await updateRes.text();
        throw new Error("Non-JSON response from /api/users/update: " + text.slice(0, 300));
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      alert("Upload failed: " + (err?.message || "unknown"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: form.username, bio: form.bio }),
      });

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const json = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(json));
        // update local user state from returned user (if provided)
        const updatedUser = json.user;
        setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));
        // If server returned profilepic, update UI
        if (updatedUser?.profilepic) setProfilePic(updatedUser.profilepic);
        alert("Profile updated!");
      } else {
        const text = await res.text();
        throw new Error("Non-JSON response from /api/users/update: " + text.slice(0, 300));
      }
    } catch (err: any) {
      console.error("Profile update failed:", err);
      alert("Profile update failed: " + (err?.message || "unknown"));
    }
  }

  if (loadingUser) return <p className="text-center mt-20 text-white">Loading...</p>;
  if (!user) return <p className="text-center mt-20 text-white">Not logged in</p>;

  return (
    <div className="flex flex-col items-center mt-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="flex flex-col items-center space-y-4">
        <img
          src={profilePic!}
          alt="profile"
          className="w-24 h-24 rounded-full border-2 border-blue-500 object-cover"
        />

        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">
          {uploading ? "Uploading..." : "Change Picture"}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 w-80 flex flex-col space-y-4">
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="bg-gray-800 p-2 rounded text-white"
          placeholder="Username"
        />
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="bg-gray-800 p-2 rounded text-white"
          placeholder="Write your bio..."
          rows={3}
        />
        <button type="submit" className="bg-green-600 hover:bg-green-700 py-2 rounded font-semibold">
          Save Changes
        </button>
      </form>
    </div>
  );
}
