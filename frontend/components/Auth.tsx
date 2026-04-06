"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Auth({ onLogin }: { onLogin: (token: string, username: string) => void }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: username,
                    password: password,
                });

                if (error) throw error;

                if (data.session) {
                    onLogin(data.session.access_token, data.user.email || username);
                }
            } else {
                const { error } = await supabase.auth.signUp({
                    email: username,
                    password: password,
                    options: {
                        data: {
                            username: username.split("@")[0],
                            role: role,
                        }
                    }
                });

                if (error) throw error;

                setIsLogin(true);
                setError("Registration successful! Check your email to confirm.");
            }

        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-slate-100/40 to-slate-200/20 dark:from-slate-800/20 dark:to-slate-900/10 pointer-events-none"></div>

            <div className="relative z-10">
                <h2 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100 tracking-wide">
                    {isLogin ? "Campus Login" : "Create Account"}
                </h2>

                <div className="flex mb-8 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                            isLogin
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                        Login
                    </button>

                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                            !isLogin
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                            placeholder="Enter email address..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                            >
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                            </select>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold tracking-wide rounded-lg"
                    >
                        {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
}