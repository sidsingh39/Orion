"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
// Removed Button import as it's no longer used for the mobile menu toggle

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });
const Auth = dynamic(() => import("@/components/Auth"), { ssr: false });

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  // Session State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Changed from isSidebarOpen

  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
    setSessions([]);
    setMessages([]);
    setCurrentSessionId(null);
  };

  // Initial Load
  const fetchSessions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data);
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  }, [API_URL, token]);


  useEffect(() => {
    if (token) fetchSessions();
  }, [fetchSessions, token]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      // Simple scroll to bottom
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);



  async function selectSession(id: string) {
    if (!token) return;
    setCurrentSessionId(id);
    setIsHistoryOpen(false); // Close on mobile
    try {
      const res = await axios.get(`${API_URL}/api/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.delete(`${API_URL}/api/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(prev => prev.filter(s => s.id !== id));
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

    const newMsg = { role: "user", content: userContent };
    setMessages(prev => [...prev, newMsg]);

    try {
      let sessionId = currentSessionId;

      // Create session if first message
      if (!sessionId) {
        const title = userContent.slice(0, 30) + (userContent.length > 30 ? "..." : "");
        const sessionRes = await axios.post(`${API_URL}/api/sessions`, { title }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        sessionId = sessionRes.data.id;
        setCurrentSessionId(sessionId!);
        setSessions(prev => [sessionRes.data, ...prev]);
      }

      // Send chat (Streaming)
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: userContent, session_id: sessionId }),
      });

      if (!response.ok || !response.body) {
        throw new Error(response.statusText);
      }

      setIsLoading(false); // Hide skeleton once stream starts

      // Initial empty message
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
          // Ensure we are updating the AI message we just added
          if (lastMsg.role === "ai") {
            lastMsg.content = aiContent;
          }
          return newMsg;
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, something went wrong." }]);
    } finally {
      setIsLoading(false);
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
        <div className="absolute inset-0 z-0 opacity-50">
          <Scene3D />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <Auth onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground relative overflow-hidden font-sans selection:bg-cyan-500/30">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Scene3D />
      </div>

      {/* Navigation (Fixed Top) */}
      <Navbar onHistoryClick={() => setIsHistoryOpen(!isHistoryOpen)} user={user} onLogout={handleLogout} />

      {/* History Overlay (Dropdown) */}
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

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col h-full pt-20 pb-24 px-4 md:px-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 animate-in fade-in duration-700">
                {/* Placeholder content if needed */}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                        max-w-[85%] px-5 py-3 rounded-2xl text-base backdrop-blur-md border leading-relaxed
                        ${msg.role === "user"
                      ? "bg-cyan-600/90 text-white border-cyan-500/50 rounded-tr-sm shadow-lg shadow-cyan-900/20"
                      : "bg-white/10 text-white border-white/10 rounded-tl-sm shadow-lg"
                    }
                      `}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white border-white/10 rounded-tl-sm shadow-lg max-w-[85%] px-5 py-3 rounded-2xl backdrop-blur-md border leading-relaxed">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px] bg-white/20" />
                    <Skeleton className="h-4 w-[200px] bg-white/20" />
                  </div>
                </div>
              </div>
            )}
            {/* Spacer for bottom */}
            <div className="h-4" />
          </div>
        </div>
      </main>

      {/* Input Area (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center gap-2 bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-full shadow-2xl ring-1 ring-white/5 hover:ring-white/10 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 min-w-0 bg-transparent text-white placeholder-white/40 px-6 py-3 outline-none text-base disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="
                p-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all shadow-lg shadow-cyan-500/20 group
                "
            >
              <Send size={20} className={`transition-transform duration-300 ${input.trim() ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : ""}`} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
