"use client";

import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { Session } from "@/types";

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  user?: string | null;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Dropdown Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-[var(--card-bg)]/95 backdrop-blur-2xl border-b border-[var(--card-border)] shadow-2xl transition-transform duration-500 ease-out transform",
          isOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="max-w-4xl mx-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-16">
            <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-wide">
              History
            </h2>

            <div className="flex gap-3">
              <Button
                onClick={onNewChat}
                className="
                  bg-[var(--accent-primary)]
                  hover:bg-[var(--accent-hover)]
                  text-white
                  rounded-xl
                  transition-all
                  shadow-md
                "
              >
                <Plus size={18} className="mr-2" />
                New Chat
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-[var(--foreground-soft)] hover:text-[var(--foreground)]"
              >
                <X size={24} />
              </Button>
            </div>
          </div>

          {/* Sessions Grid */}
          <ScrollArea className="h-[300px] w-full pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={cn(
                    "group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border shadow-sm",
                    currentSessionId === session.id
                      ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] shadow-md"
                      : "bg-[var(--card-bg)] border-[var(--card-border)] hover:shadow-md"
                  )}
                >
                  <div className="flex items-center flex-1 min-w-0 mr-3">
                    <MessageSquare
                      size={18}
                      className={cn(
                        "flex-shrink-0 mr-3",
                        currentSessionId === session.id
                          ? "text-[var(--accent-primary)]"
                          : "text-[var(--foreground-soft)]"
                      )}
                    />

                    <span
                      className={cn(
                        "text-sm truncate font-medium",
                        currentSessionId === session.id
                          ? "text-[var(--foreground)]"
                          : "text-[var(--foreground-soft)]"
                      )}
                    >
                      {session.title || "New Conversation"}
                    </span>
                  </div>

                  <button
                    onClick={(e) => onDeleteSession(e, session.id)}
                    className="
                      opacity-0 group-hover:opacity-100
                      p-2 rounded-lg
                      hover:bg-red-500/10
                      text-[var(--foreground-soft)]
                      hover:text-red-500
                      transition-all
                    "
                    title="Delete Chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="col-span-full py-12 text-center text-[var(--foreground-soft)]">
                  No chat history found. Start a new conversation.
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Bottom Divider */}
          <div className="mt-4 pt-4 border-t border-[var(--card-border)] text-center">
            <div className="inline-block w-12 h-1 bg-[var(--accent-primary)]/30 rounded-full" />
          </div>
        </div>
      </div>
    </>
  );
}