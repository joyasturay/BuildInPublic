// pages/api/signed-url.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // SERVER ONLY
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { path, bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME, expiresIn = 60 } = req.body;
  if (!path) return res.status(400).json({ error: "Missing path" });

  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) {
      console.error("createSignedUrl error:", error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ url: data.signedUrl });
  } catch (err) {
    console.error("Signed URL failed:", err);
    return res.status(500).json({ error: "Signed URL failed" });
  }
}
