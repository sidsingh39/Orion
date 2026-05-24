"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { chatApi } from "@/lib/api";

const Auth = dynamic(() => import("@/components/Auth"), { ssr: false });

const departments = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Chemical Engineering",
];

const categories = [
  "Academic",
  "Assignment",
  "Exam",
  "Event",
  "Placement",
  "Faculty",
  "General",
];

export default function NoticesPage() {
  const [token, setToken] = useState<string | null>(null);

  const [user, setUser] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [notices, setNotices] = useState<any[]>([]);

  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");

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

  const handleLogin = (newToken: string, username: string) => {
    setToken(newToken);
    setUser(username);
  };

  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase");

    await supabase.auth.signOut();

    setToken(null);
    setUser(null);
  };

  async function fetchNotices() {
    try {
      const { supabase } = await import("@/lib/supabase");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userDepartment = user?.user_metadata?.department;

      const userRole = user?.user_metadata?.role;

      const res = await chatApi.getLatestNotices();
      console.log("FULL RESPONSE:", res);
      console.log("RESPONSE DATA:", res?.data);
      console.log("DATA KEYS:", Object.keys(res?.data || {}));

      console.log("RAW NOTICE RESPONSE:", res);

      // Handle multiple possible response formats
      const data: any = res?.data || {};

      const allNotices = Array.isArray(data)
        ? data
        : Array.isArray(data.notices)
          ? data.notices
          : [];
      const visibleNotices = allNotices.filter(
        (notice: any) =>
          // visible to everyone
          notice.visibility_scope === "all" ||
          // role based visibility
          notice.visibility_scope === userRole ||
          // department visibility
          notice.department === "All" ||
          notice.department === userDepartment,
      );

      console.log("VISIBLE:", visibleNotices);

      setNotices(visibleNotices);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    }
  }
  useEffect(() => {
    if (token) {
      fetchNotices();
    }
  }, [token]);

  const filteredNotices = notices.filter((notice) => {
    const departmentMatch =
      departmentFilter === "all" || notice.department === departmentFilter;

    const categoryMatch =
      categoryFilter === "all" || notice.category === categoryFilter;

    const searchMatch =
      searchQuery.trim() === "" ||
      notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.summary?.toLowerCase().includes(searchQuery.toLowerCase());

    return departmentMatch && categoryMatch && searchMatch;
  });

  if (loading) {
    return (
      <div
        className="
      h-screen
      flex
      items-center
      justify-center
      bg-background
      text-foreground
      "
      >
        Loading ORION Notices...
      </div>
    );
  }

  if (!token) {
    return (
      <div
        className="
      h-screen
      flex
      items-center
      justify-center
      bg-background
      "
      >
        <div
          className="
        w-full
        max-w-md
        "
        >
          <Auth onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="
    min-h-screen
    bg-background
    text-foreground
    "
    >
      <Navbar user={user} onLogout={handleLogout} />

      <main
        className="
      max-w-6xl
      mx-auto
      px-6
      py-28
      "
      >
        <div className="mb-10">
          <h1
            className="
          text-5xl
          font-bold
          text-[#d4af37]
          mb-3
          "
          >
            ORION Notices
          </h1>

          <p
            className="
          text-[var(--foreground-soft)]
          "
          >
            Latest institutional updates and announcements.
          </p>

          <div
            className="
          flex
          flex-wrap
          gap-3
          mt-5
          "
          >
            <div className="px-4 py-2 rounded-full bg-[rgba(182,140,36,0.12)]">
              📄 {notices.length} Notices
            </div>
          </div>
        </div>

        <div
          className="
        flex
        flex-col
        md:flex-row
        gap-4
        mb-10
        "
        >
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
            "
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="
            px-5 py-3
            rounded-2xl
            bg-[rgba(20,23,28,0.95)]
            "
          >
            <option value="all">All Departments</option>

            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="
            px-5 py-3
            rounded-2xl
            bg-[rgba(20,23,28,0.95)]
            "
          >
            <option value="all">All Categories</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {filteredNotices.length === 0 ? (
          <div
            className="
          text-center
          py-20
          "
          >
            <div
              className="
            text-6xl
            mb-4
            "
            >
              📢
            </div>

            <h2
              className="
            text-2xl
            text-[#d4af37]
            "
            >
              No notices found
            </h2>
          </div>
        ) : (
          <div
            className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
          "
          >
            {filteredNotices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notices/${notice.id}`}
                className="
                rounded-3xl
                p-8
                border
                border-[rgba(182,140,36,0.14)]
                hover:border-[#d4af37]
                transition-all
                "
              >
                <h2
                  className="
                text-2xl
                font-bold
                mb-3
                "
                >
                  {notice.title}
                </h2>

                <p
                  className="
                text-[var(--foreground-soft)]
                mb-5
                "
                >
                  {notice.summary || "No summary available"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
