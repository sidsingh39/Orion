"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Upload } from "@/types";
import { uploadApi } from "@/lib/api";
import { toast } from "sonner";

const Auth = dynamic(() => import("@/components/Auth"), { ssr: false });

export default function UploadPage() {
  // Authentication state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [status, setStatus] = useState("");

  // Restore active session
  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setToken(session.access_token);
          setUser(session.user.email || null);
        }
        setIsAuthLoading(false);
      });
    });
  }, []);

  // Login callback
  const handleLogin = (newToken: string, username: string) => {
    setToken(newToken);
    setUser(username);
  };

  // Logout callback
  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    setUploads([]);
  };

  // Fetch uploads when authenticated
  useEffect(() => {
    if (token) fetchUploads();
  }, [token]);

  async function fetchUploads() {
    if (!token) return;

    try {
      const res = await uploadApi.getUploads();

      if (res.data.uploads) {
        setUploads(res.data.uploads);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  }

  // Upload file handler
  async function handleUpload() {
    if (!file || !token) return;

    setIsUploading(true);
    setStatus("");

    const loadingToast = toast.loading("Processing your document...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadApi.uploadFile(formData);
      const verification = res.data.verification;

      if (verification) {
        setStatus(
          `${verification.message} ${
            verification.verified ? "✔ Verified" : "⚠ Low confidence"
          }`
        );
      }

      toast.success("Document uploaded successfully.", {
        id: loadingToast,
      });

      setFile(null);
      fetchUploads();
    } catch (error) {
      console.error("Upload failed:", error);

      toast.error("Upload failed. Verification incomplete.", {
        id: loadingToast,
      });

      setStatus("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  // Delete upload handler
  async function handleDelete(filename: string) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`) || !token) return;

    try {
      await uploadApi.deleteUpload(filename);
      fetchUploads();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete file.");
    }
  }

  // Initial loading screen
  if (isAuthLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-[#b68c24] animate-pulse text-lg tracking-[0.18em] uppercase font-semibold">
          ORION Initializing...
        </div>
      </div>
    );
  }

  // Auth gate
  if (!token) {
    return (
      <div className="h-screen bg-background text-foreground relative overflow-hidden font-sans flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md">
          <Auth onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans transition-colors duration-300">

      {/* Navigation */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Upload Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 py-10">

        {/* Upload Card */}
        <div className="w-full max-w-2xl rounded-3xl p-8 bg-[rgba(255,250,240,0.88)] dark:bg-[rgba(26,29,34,0.88)] backdrop-blur-xl border border-[rgba(182,140,36,0.14)] shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_42px_rgba(0,0,0,0.32)]">

          <h1 className="text-3xl font-bold text-center text-[#2a2118] dark:text-[#f5efe2] mb-4">
            Upload Knowledge Base
          </h1>

          <p className="text-center text-[#6d6255] dark:text-[#b8ab98] mb-8 leading-relaxed">
            Upload academic material, notices, or institutional documents. ORION evaluates trust before indexing knowledge.
          </p>

          <div className="flex flex-col items-center space-y-6">

            {/* File Input */}
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".txt,.md,.pdf,.png,.jpg,.jpeg"
              className="block w-full max-w-sm text-sm text-[#6d6255] dark:text-[#c7b9a4]
                file:mr-4 file:py-3 file:px-5
                file:rounded-xl file:border-0
                file:bg-[rgba(182,140,36,0.10)]
                file:text-[#8a6a22]
                dark:file:text-[#d4af37]
                file:font-medium
                hover:file:bg-[rgba(182,140,36,0.16)]"
            />

            {/* Selected File */}
            {file && (
              <div className="text-[#8a6a22] dark:text-[#d4af37] font-medium">
                Selected: {file.name}
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-10 py-3 rounded-2xl bg-[#b68c24] hover:bg-[#d4af37] text-black font-medium disabled:opacity-50 transition-all"
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </button>

            {/* Status */}
            {status && (
              <p
                className={`text-sm ${
                  status.includes("Low confidence")
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {status}
              </p>
            )}
          </div>
        </div>

        {/* Upload History */}
        <div className="w-full max-w-3xl mt-12">
          <h2 className="text-2xl font-bold mb-6 text-[#2a2118] dark:text-[#f5efe2]">
            Recent Uploads
          </h2>

          <UploadAlbum uploads={uploads} onDelete={handleDelete} />
        </div>
      </main>
    </div>
  );
}

// Upload gallery component
function UploadAlbum({
  uploads,
  onDelete,
}: {
  uploads: any[];
  onDelete: (filename: string) => void;
}) {
  if (uploads.length === 0) {
    return (
      <p className="text-[#8f8477] dark:text-[#7c7368] italic">
        No uploads yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {uploads.map((file, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 bg-[rgba(255,250,240,0.80)] dark:bg-[rgba(26,29,34,0.84)] border border-[rgba(182,140,36,0.10)]"
        >
          {/* File Name */}
          <p className="text-sm font-medium text-[#2a2118] dark:text-[#f5efe2] truncate">
            {file.filename}
          </p>

          {/* Date */}
          <p className="text-xs text-[#8f8477] dark:text-[#7c7368] mt-1">
            {new Date(file.timestamp).toLocaleDateString()}
          </p>

          {/* Trust Score */}
          {file.trust_score !== undefined && (
            <p
              className={`text-xs mt-2 ${
                file.trust_score >= 50
                  ? "text-green-600 dark:text-green-400"
                  : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              Trust Score: {file.trust_score}%
            </p>
          )}

          {/* Trust Message */}
          {file.trust_message && (
            <p className="text-xs text-[#6d6255] dark:text-[#b8ab98] mt-1 leading-relaxed">
              {file.trust_message}
            </p>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete(file.filename)}
            className="mt-3 text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}