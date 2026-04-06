"use client";

import { useState, useEffect } from "react";
import Auth from "@/components/Auth";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function Profile() {
    // Stores active session token
    const [token, setToken] = useState<string | null>(null);

    // Stores current user display name
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        // Fetch current session on initial load
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setToken(session.access_token);
                setUser(
                    session.user.user_metadata.username ||
                    session.user.email?.split("@")[0] ||
                    "User"
                );
            }
        });

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setToken(session.access_token);
                setUser(
                    session.user.user_metadata.username ||
                    session.user.email?.split("@")[0] ||
                    "User"
                );
            } else {
                setToken(null);
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Immediate UI update after login
    const login = (newToken: string, username: string) => {
        setToken(newToken);
        setUser(username);
    };

    // Logout handler
    const logout = async () => {
        await supabase.auth.signOut();
        setToken(null);
        setUser(null);
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans transition-colors duration-300">

            {/* Top Navigation */}
            <Navbar />

            {/* Main Profile Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">

                {!token ? (
                    <Auth onLogin={login} />
                ) : (
                    <div className="w-full max-w-2xl p-8 rounded-3xl bg-[rgba(255,250,240,0.88)] dark:bg-[rgba(26,29,34,0.88)] backdrop-blur-xl border border-[rgba(182,140,36,0.18)] shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.35)] text-center transition-all duration-300">

                        {/* Profile Avatar */}
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full p-[1px] bg-gradient-to-br from-[#b68c24] to-[#d4af37] shadow-[0_0_18px_rgba(182,140,36,0.22)]">
                            <div className="w-full h-full rounded-full bg-[rgba(250,248,243,0.95)] dark:bg-[#111318] flex items-center justify-center text-3xl">
                                👤
                            </div>
                        </div>

                        {/* Username */}
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2a2118] dark:text-[#f5efe2] mb-2">
                            WELCOME, {user?.toUpperCase()}
                        </h2>

                        {/* Subtitle */}
                        <p className="text-sm tracking-[0.25em] uppercase text-[#8a6a22] dark:text-[#caa84a] mb-8">
                            Authorized Access
                        </p>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                            {/* Account Status */}
                            <div className="p-4 rounded-2xl bg-[rgba(255,252,246,0.75)] dark:bg-[#14171c] border border-[rgba(182,140,36,0.12)]">
                                <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8a6a22] dark:text-[#d4af37] mb-2">
                                    Account Status
                                </h3>
                                <p className="text-foreground font-medium">
                                    Active
                                </p>
                            </div>

                            {/* Member Since */}
                            <div className="p-4 rounded-2xl bg-[rgba(255,252,246,0.75)] dark:bg-[#14171c] border border-[rgba(182,140,36,0.12)]">
                                <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8a6a22] dark:text-[#d4af37] mb-2">
                                    Member Since
                                </h3>
                                <p className="text-foreground font-medium">
                                    2024
                                </p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="px-8 py-3 rounded-xl border border-[rgba(182,140,36,0.28)] bg-[rgba(182,140,36,0.08)] hover:bg-[rgba(182,140,36,0.14)] text-[#8a6a22] dark:text-[#d4af37] font-medium tracking-[0.14em] uppercase transition-all duration-300"
                        >
                            Terminate Session
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}