"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { chatApi } from "@/lib/api";

export default function NoticeDetailPage() {
  const params = useParams();

  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotice();
  }, []);

  async function fetchNotice() {
    try {
      const res = await chatApi.getNoticeById(
        params.id as string
      );

      setNotice(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        Loading Notice...
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        Notice not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      <Navbar />

      <main className="max-w-5xl mx-auto pt-32 px-6 pb-20">

        <div className="
          rounded-3xl
          p-10
          bg-[rgba(255,250,240,0.05)]
          border border-[rgba(182,140,36,0.14)]
          backdrop-blur-xl
        ">

          <div className="flex items-center justify-between mb-6">

            <span className="
              px-4 py-2 rounded-full
              bg-[rgba(182,140,36,0.18)]
              text-[#d4af37]
              text-sm
              uppercase
            ">
              {notice.category}
            </span>

            <span className={`
              px-4 py-2 rounded-full text-sm font-medium
              ${
                notice.trust_score >= 50
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }
            `}>
              Trust {notice.trust_score}%
            </span>

          </div>

          <h1 className="text-5xl font-bold mb-6">
            {notice.title}
          </h1>

          <p className="text-xl text-[var(--foreground-soft)] mb-10">
            {notice.summary || "No summary available."}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">

            <div>
              <p className="text-[#d4af37]">Department</p>
              <p>{notice.department}</p>
            </div>

            <div>
              <p className="text-[#d4af37]">Program</p>
              <p>{notice.program}</p>
            </div>

            <div>
              <p className="text-[#d4af37]">Semester</p>
              <p>{notice.semester}</p>
            </div>

            <div>
              <p className="text-[#d4af37]">Uploaded By</p>
              <p>{notice.uploader_role}</p>
            </div>

            <div>
              <p className="text-[#d4af37]">Deadline</p>
              <p>{notice.deadline || "Not specified"}</p>
            </div>

            <div>
              <p className="text-[#d4af37]">Visibility</p>
              <p>{notice.visibility_scope}</p>
            </div>

          </div>

          <div className="
            rounded-2xl
            p-6
            bg-black/20
            border border-[rgba(182,140,36,0.12)]
          ">

            <h2 className="text-2xl font-bold mb-4">
              Full Notice
            </h2>

            <div className="
              whitespace-pre-wrap
              leading-relaxed
              text-[var(--foreground-soft)]
            ">
              {notice.raw_content}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}