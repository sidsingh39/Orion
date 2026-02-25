"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "@/components/Navbar";
import dynamic from "next/dynamic";

const Auth = dynamic(() => import("@/components/Auth"), { ssr: false });

export default function UploadPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [status, setStatus] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploads, setUploads] = useState<any[]>([]);

  // Check for existing session
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

  const handleLogin = (newToken: string, username: string) => {
    setToken(newToken);
    setUser(username);
  };

  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    setUploads([]);
  };

  useEffect(() => {
    if (token) fetchUploads();
  }, [token]);

  async function fetchUploads() {
    if (!token) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await axios.get(`${apiUrl}/api/uploads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.uploads) {
        setUploads(res.data.uploads);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  }

  async function handleUpload() {
    if (!file || !token) return;

    setIsUploading(true);
    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });
      setStatus("Uploaded Successfully!");
      setFile(null);
      fetchUploads(); // Refresh the list
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(filename: string) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`) || !token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      await axios.delete(`${apiUrl}/api/upload/${encodeURIComponent(filename)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUploads(); // Refresh list
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete file.");
    }
  }

  if (isAuthLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-cyan-500 animate-pulse text-xl tracking-tighter font-bold">ORION SYSTEM INITIALIZING...</div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans selection:bg-cyan-500/30 transition-colors duration-300">

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">

        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-cyan-500/10 shadow-[0_0_60px_rgba(0,200,255,0.15)]">
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-400">
            Upload Knowledge Base
          </h1>

          <p className="text-gray-400 text-center mb-8">
            Upload your college documents (Text, Markdown) to enhance the AI&apos;s knowledge.
          </p>

          <div className="flex flex-col items-center space-y-6">

            <div className="w-full">
              <label
                htmlFor="file-upload"
                className="
                  flex flex-col items-center justify-center w-full h-64 
                  border-2 border-dashed border-cyan-500/30 rounded-2xl 
                  cursor-pointer bg-black/20 hover:bg-black/40 
                  transition-all duration-300 group
                "
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-12 h-12 mb-4 text-cyan-500/50 group-hover:text-cyan-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">TXT, MD, PDF, IMAGES (MAX. 10MB)</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".txt,.md,.pdf,.png,.jpg,.jpeg"
                />
              </label>
            </div>

            {file && (
              <div className="text-cyan-300 font-medium bg-cyan-950/30 px-4 py-2 rounded-lg border border-cyan-500/20">
                Selected: {file.name}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`
                px-10 py-3 
                bg-gradient-to-r from-cyan-600 to-blue-600 
                text-white font-medium tracking-wide
                rounded-full 
                transition-all duration-300
                shadow-[0_0_20px_rgba(6,182,212,0.4)]
                ${!file || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:from-cyan-500 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'}
              `}
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </button>

            {status && (
              <p className={`mt-3 ${status.includes("failed") ? "text-red-400" : "text-green-400"}`}>
                {status}
              </p>
            )}
          </div>
        </div>

        {/* Upload Album / History */}
        <div className="w-full max-w-3xl mt-12">
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-400">
            Recent Uploads
          </h2>
          <UploadAlbum uploads={uploads} onDelete={handleDelete} />
        </div>
      </main>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UploadAlbum({ uploads, onDelete }: { uploads: any[], onDelete: (filename: string) => void }) {
  if (uploads.length === 0) {
    return <p className="text-gray-500 italic">No uploads yet.</p>;
  }

  async function handlePreview(fileUrl: string) {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      alert("Preview not available for this file.");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {uploads.map((file, i) => (
        <div key={i} className="bg-white/5 border border-cyan-500/10 rounded-xl p-4 hover:bg-white/10 transition-colors group relative">
          <div className="absolute top-2 right-2 flex space-x-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            {file.file_url && (
              <button
                onClick={() => handlePreview(file.file_url)}
                className="p-1.5 bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                title="Preview file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            )}
            <button
              onClick={() => onDelete(file.filename)}
              className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              title="Delete file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-cyan-900/30 rounded-lg text-cyan-400">
              {file.type && file.type.includes("image") ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ) : file.filename && file.filename.endsWith(".pdf") ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-200 truncate" title={file.filename}>{file.filename}</p>
              <p className="text-xs text-gray-500">{new Date(file.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
          {file.chunk_text && (
            <p className="text-xs text-gray-400 line-clamp-3 bg-black/20 p-2 rounded border border-white/5">
              {file.chunk_text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
