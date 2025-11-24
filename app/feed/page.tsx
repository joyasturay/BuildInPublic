"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface PostType {
  title: string;
  description: string;
}

export default function Feed() {
  const [isFetching, setIsFetching] = useState(true);       // 👈 for initial page load
  const [isPosting, setIsPosting] = useState(false);        // 👈 for form submit
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [form, setForm] = useState<PostType>({ title: "", description: "" });
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

  async function fetchPosts() {
    try {
      const feedData = await axios.get("/api/posts");
      setPosts(feedData.data.posts || []);
    } catch (err: any) {
      const friendly =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(friendly);
      setToast({ type: "error", message: friendly });
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto hide toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setIsPosting(true);
    setError(null);

    try {
      const res = await axios.post("/api/posts", form);
      const newPost = res.data.savepost  || null;
      if (newPost) {
        setPosts((prev) => [newPost, ...prev]); 
      } else {
        fetchPosts();
      }

      setForm({
        title: "",
        description: "",
      });

      setToast({ type: "success", message: "Post created successfully 🎉" });
    } catch (err: any) {
      const friendly =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(friendly);
      setToast({ type: "error", message: friendly });
    } finally {
      setIsPosting(false);
    }
  }
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8 px-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-sm backdrop-blur-sm
              ${toast.type === "error" ? "bg-red-500/90" : "bg-emerald-500/90"}`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <div className="w-full max-w-xl space-y-6">
        <div className="bg-gray-800/80 rounded-2xl shadow-lg p-5 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Create a post</h2>

          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300">Title</label>
              <input
                type="text"
                placeholder="Enter title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full bg-gray-900/70 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Content</label>
              <textarea
                placeholder="What's on your mind?"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                rows={4}
                className="mt-1 w-full bg-gray-900/70 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPosting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2"
            >
              {isPosting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </button>
          </form>
        </div>

        <div className="space-y-3 w-full">
          {posts.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">No posts for now</p>
          ) : (
            posts.map((p: any) => (
              <div
                key={p.id || p.title}
                className="bg-gray-800/80 rounded-2xl border border-gray-700 p-4 shadow-md"
              >
                <div>
                  <p className="font-semibold">{p.author.username}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
                <h3 className="font-semibold text-lg mb-1">{p.title}</h3>
                {p.content && (
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {p.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
