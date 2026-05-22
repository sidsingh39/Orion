"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { Navbar } from "@/components/Navbar";
import { chatApi } from "@/lib/api";
import Link from "next/link";

const Auth = dynamic(() => import("@/components/Auth"), {
  ssr: false,
});

export default function NoticesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [notices, setNotices] = useState<any[]>([]);

  // =========================================
  // FILTER STATES
  // =========================================

  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");

  // =========================================
  // AUTH RESTORE
  // =========================================

  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setToken(session.access_token);
          setUser(session.user.email || null);
        }

        setLoading(false);
      });
    });
  }, []);

  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = (newToken: string, username: string) => {
    setToken(newToken);
    setUser(username);
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase");

    await supabase.auth.signOut();

    setToken(null);
    setUser(null);
  };

  // =========================================
  // FETCH NOTICES
  // =========================================

  async function fetchNotices() {
    try {
      const res = await chatApi.getLatestNotices();

      console.log("NOTICES:", res.data);

      setNotices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    }
  }

  useEffect(() => {
    if (token) {
      fetchNotices();
    }
  }, [token]);

  // =========================================
  // FILTERED NOTICES
  // =========================================

  const filteredNotices = notices.filter((notice) => {
    const departmentMatch =
      departmentFilter === "all" || notice.department === departmentFilter;

    const categoryMatch =
      categoryFilter === "all" || notice.category === categoryFilter;

    const searchMatch =
      searchQuery.trim() === "" ||
      notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.department?.toLowerCase().includes(searchQuery.toLowerCase());

    return departmentMatch && categoryMatch && searchMatch;
  });

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        Loading ORION Notices...
      </div>
    );
  }

  // =========================================
  // AUTH GATE
  // =========================================

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <Auth onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-6 py-28">
        {/* HEADER */}

        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#d4af37] mb-3">
            ORION Notices
          </h1>

          <p className="text-[var(--foreground-soft)]">
            Latest institutional updates, assignments, and faculty notices.
          </p>
        </div>

        {/* FILTERS */}

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              flex-1
              px-5 py-3
              rounded-2xl
              bg-[rgba(255,250,240,0.05)]
              border border-[rgba(182,140,36,0.14)]
              outline-none
              focus:border-[#d4af37]
            "
          />

          {/* DEPARTMENT */}

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="
    px-5 py-3
    rounded-2xl
    bg-[rgba(20,23,28,0.95)]
    text-[#f5efe2]
    border border-[rgba(182,140,36,0.14)]
    outline-none
    focus:border-[#d4af37]
    focus:ring-2
    focus:ring-[rgba(212,175,55,0.18)]
    appearance-none
    cursor-pointer
    min-w-[220px]
  "
          >
            <option value="all" className="bg-[#14171c] text-[#f5efe2]">
              All Departments
            </option>

            <option
              value="Computer Science and Engineering"
              className="bg-[#14171c] text-[#f5efe2]"
            >
              Computer Science and Engineering
            </option>

            <option value="CSE" className="bg-[#14171c] text-[#f5efe2]">
              CSE
            </option>

            <option value="unknown" className="bg-[#14171c] text-[#f5efe2]">
              Unknown
            </option>
          </select>

          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="
    px-5 py-3
    rounded-2xl
    bg-[rgba(20,23,28,0.95)]
    text-[#f5efe2]
    border border-[rgba(182,140,36,0.14)]
    outline-none
    focus:border-[#d4af37]
    focus:ring-2
    focus:ring-[rgba(212,175,55,0.18)]
    appearance-none
    cursor-pointer
    min-w-[180px]
  "
          >
            <option value="all" className="bg-[#14171c] text-[#f5efe2]">
              All Categories
            </option>

            <option value="academic" className="bg-[#14171c] text-[#f5efe2]">
              Academic
            </option>

            <option value="Assessment" className="bg-[#14171c] text-[#f5efe2]">
              Assessment
            </option>

            <option value="unknown" className="bg-[#14171c] text-[#f5efe2]">
              Unknown
            </option>
          </select>
        </div>

        {/* EMPTY STATE */}

        {filteredNotices.length === 0 ? (
          <div className="text-center py-20 text-[var(--foreground-soft)]">
            <h2 className="text-2xl mb-3 text-[#d4af37]">No notices found</h2>

            <p>Try adjusting your filters or upload new documents.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotices.map((notice) => (
              <Link
                href={`/notices/${notice.id}`}
                key={notice.id}
                className="
                    rounded-3xl p-8
                    bg-[rgba(255,250,240,0.05)]
                    border border-[rgba(182,140,36,0.14)]
                    backdrop-blur-xl
                    hover:border-[#d4af37]
                    hover:scale-[1.01]
                    transition-all duration-300
                    block
                  "
              >
                {/* TOP */}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-[rgba(182,140,36,0.15)] text-[#d4af37]">
                    {notice.category || "General"}
                  </span>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      notice.trust_score >= 50
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    Trust {notice.trust_score || 0}%
                  </span>
                </div>

                {/* TITLE */}

                <h2 className="text-2xl font-bold mb-3 text-[#f5efe2]">
                  {notice.title}
                </h2>

                {/* SUMMARY */}

                <p className="text-[var(--foreground-soft)] leading-relaxed mb-5">
                  {notice.summary || "No summary available."}
                </p>

                {/* INFO */}

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-[#d4af37]">Department:</span>{" "}
                    {notice.department || "Unknown"}
                  </div>

                  <div>
                    <span className="text-[#d4af37]">Program:</span>{" "}
                    {notice.program || "Unknown"}
                  </div>

                  <div>
                    <span className="text-[#d4af37]">Semester:</span>{" "}
                    {notice.semester || "Unknown"}
                  </div>

                  <div>
                    <span className="text-[#d4af37]">Uploaded By:</span>{" "}
                    {notice.uploader_role || "Unknown"}
                  </div>

                  <div>
                    <span className="text-[#d4af37]">Deadline:</span>{" "}
                    {notice.deadline || "Not specified"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
