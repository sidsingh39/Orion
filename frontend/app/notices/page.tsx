"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { chatApi } from "@/lib/api";

const Auth = dynamic(() => import("@/components/Auth"), { ssr: false });

export default function NoticesPage() {
  const [token, setToken] = useState<string | null>(null);

  const [user, setUser] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [notices, setNotices] = useState<any[]>([]);

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

    const res =
      await chatApi.getLatestNotices();

    console.log(
      "FULL RESPONSE:",
      res
    );

    const data:any =
      res?.data || {};

    const allNotices =
      Array.isArray(data)
      ? data
      : Array.isArray(data.notices)
      ? data.notices
      : [];

    console.log(
      "ALL NOTICES:",
      allNotices
    );

    // NO visibility filtering
    setNotices(allNotices);

  }

  catch(err){

    console.error(
      "Failed to fetch notices:",
      err
    );

  }
}
  useEffect(() => {
    if (token) {
      fetchNotices();
    }
  }, [token]);

  const displayedNotices = notices;
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
              📄 {displayedNotices.length} Notices
            </div>
          </div>
        </div>

        

        {displayedNotices.length === 0 ? (
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
            {displayedNotices.map((notice) => (
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
