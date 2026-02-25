"use client";

import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Session {
    id: string;
    title: string;
    created_at: string;
}

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
    user
}: SidebarProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Dropdown Panel */}
            <div className={cn(
                "fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl transition-transform duration-500 ease-out transform",
                isOpen ? "translate-y-0" : "-translate-y-full"
            )}>
                <div className="max-w-4xl mx-auto p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pt-16"> {/* pt-16 to clear navbar */}
                        <h2 className="text-xl font-semibold text-white tracking-wide">History</h2>
                        <div className="flex gap-3">
                            <Button
                                onClick={onNewChat}
                                className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-100 border border-cyan-500/30 rounded-xl transition-all"
                            >
                                <Plus size={18} className="mr-2" />
                                New Chat
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </Button>
                        </div>
                    </div>

                    {/* Grid of Sessions */}
                    <ScrollArea className="h-[300px] w-full pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => onSelectSession(session.id)}
                                    className={cn(
                                        "group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border",
                                        currentSessionId === session.id
                                            ? "bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-900/20"
                                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center flex-1 min-w-0 mr-3">
                                        <MessageSquare size={18} className={cn(
                                            "flex-shrink-0 mr-3",
                                            currentSessionId === session.id ? "text-cyan-400" : "text-slate-500"
                                        )} />
                                        <span className={cn(
                                            "text-sm truncate font-medium",
                                            currentSessionId === session.id ? "text-white" : "text-slate-300 group-hover:text-white"
                                        )}>
                                            {session.title || "New Conversation"}
                                        </span>
                                    </div>

                                    <button
                                        onClick={(e) => onDeleteSession(e, session.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                                        title="Delete Chat"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {sessions.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500">
                                    No chat history found. Start a new conversation!
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                        <div className="inline-block w-12 h-1 bg-white/20 rounded-full" />
                    </div>
                </div>
            </div>
        </>
    );
}
