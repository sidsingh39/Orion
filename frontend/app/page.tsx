"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { Message, Session } from "@/types";
import { chatApi } from "@/lib/api";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });
const Auth = dynamic(() => import("@/components/Auth"), { ssr: false });

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
    setSessions([]);
    setMessages([]);
    setCurrentSessionId(null);
  };

  const fetchSessions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await chatApi.getSessions();
      setSessions(res.data);
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchSessions();
  }, [fetchSessions, token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function selectSession(id: string) {
    if (!token) return;
    setCurrentSessionId(id);
    setIsHistoryOpen(false);

    try {
      const res = await chatApi.getSession(id);
      setMessages(res.data);
    } catch (e) {
      console.error("Failed to load session", e);
    }
  }

  function handleNewChat() {
    setCurrentSessionId(null);
    setMessages([{ role: "ai", content: "Hello! How can I assist you today?" }]);
    setIsHistoryOpen(false);
  }

  async function deleteSession(e: React.MouseEvent, id: string) {
    if (!token) return;
    e.stopPropagation();

    try {
      await chatApi.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));

      if (currentSessionId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  }

  async function sendMessage() {
    if (!input.trim() || isLoading || !token) return;

    const userContent = input;
    setInput("");
    setIsLoading(true);

    const newMsg: Message = { role: "user", content: userContent };
    setMessages((prev) => [...prev, newMsg]);

    try {
      let sessionId = currentSessionId;

      if (!sessionId) {
        const title =
          userContent.slice(0, 30) + (userContent.length > 30 ? "..." : "");
        const sessionRes = await chatApi.createSession(title);
        sessionId = sessionRes.data.id;
        setCurrentSessionId(sessionId!);
        setSessions((prev) => [sessionRes.data, ...prev]);
      }

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: userContent, session_id: sessionId }),
      });

      if (!response.ok || !response.body) throw new Error(response.statusText);

      setIsLoading(false);
      setMessages((prev) => [...prev, { role: "ai", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        aiContent += text;

        setMessages((prev) => {
          const newMsg = [...prev];
          const lastMsg = newMsg[newMsg.length - 1];

          if (lastMsg.role === "ai") {
            lastMsg.content = aiContent;
          }

          return newMsg;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  if (isAuthLoading) {
    return (
      <div className="h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--accent-primary)] animate-pulse text-xl font-semibold">
          Initializing ORION...
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 z-0 opacity-40">
          <Scene3D />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <Auth onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden selection:bg-[var(--accent-primary)]/20">
      <div className="absolute inset-0 z-0 opacity-60">
        <Scene3D />
      </div>

      <Navbar
        onHistoryClick={() => setIsHistoryOpen(!isHistoryOpen)}
        user={user}
        onLogout={handleLogout}
      />

      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewChat={handleNewChat}
        onDeleteSession={deleteSession}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        user={user}
      />

      <main className="relative z-10 flex flex-col h-full pt-20 pb-24 px-4">
        <div className="flex-1 overflow-y-auto scrollbar-hide" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6 py-4">

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
                <h1 className="text-5xl font-bold text-[var(--accent-primary)] mb-4 tracking-tight">
                  ORION
                </h1>

                <p className="text-[var(--foreground-soft)] text-lg max-w-2xl leading-relaxed mb-3">
                  Your trusted academic assistant for verified campus information,
                  study support, and quiz-based learning.
                </p>

                <p className="text-[var(--foreground-soft)]/80 text-sm max-w-xl">
                  Uploaded documents are trust-verified before use.
                  Low-confidence sources are flagged automatically.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-5 py-3 rounded-2xl border leading-relaxed shadow-md ${
                    msg.role === "user"
                      ? "bg-[var(--accent-primary)] text-white border-[var(--accent-hover)]"
                      : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)]"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] px-5 py-3 rounded-2xl shadow-md">
                  <Skeleton className="h-4 w-[250px]" />
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] p-2 rounded-full shadow-xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about notes, notices, quizzes, or academics..."
              className="flex-1 bg-transparent px-6 py-3 outline-none text-[var(--foreground)]"
            />

            <button
              onClick={sendMessage}
              className="p-3 rounded-full bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] transition-all"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}