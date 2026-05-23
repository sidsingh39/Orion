"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Auth({
    onLogin,
}: {
    onLogin: (token: string, username: string) => void;
}) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Detect role from IET email pattern
    const detectRole = (email: string) => {
        const domain = "@ietlucknow.ac.in";

        if (!email.endsWith(domain)) {
            throw new Error(
                "Please use your institutional IET email."
            );
        }

        const emailPrefix = email.split("@")[0];

        return /^\d+$/.test(emailPrefix)
            ? "student"
            : "faculty";
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // Login flow
            if (isLogin) {
                const { data, error } =
                    await supabase.auth.signInWithPassword({
                        email: username,
                        password,
                    });

                if (error) throw error;

                if (data.session) {
                    onLogin(
                        data.session.access_token,
                        data.user.email || username
                    );
                }
            }

            // Register flow
            else {
                const role =
                    detectRole(username);

                const { error } =
                    await supabase.auth.signUp({
                        email: username,
                        password,

                        options: {
                            data: {
                                username:
                                    username.split("@")[0],

                                role: role,
                            },
                        },
                    });

                if (error) throw error;

                setIsLogin(true);

                setError(
                    "Registration successful. Please verify your email."
                );
            }
        } catch (err: any) {
            console.error(
                "Authentication error:",
                err
            );

            setError(
                err.message ||
                "Authentication failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md relative overflow-hidden rounded-3xl border border-[#b68c24]/20 bg-[#0f1115]/95 backdrop-blur-xl shadow-2xl p-8">

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#b68c24]/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10">

                {/* Logo + heading */}
                <div className="text-center mb-8">

                    <h1 className="text-4xl font-bold text-white tracking-wide">
                        ORION
                    </h1>

                    <p className="text-[#b68c24] text-sm mt-2 tracking-[0.2em] uppercase">
                        Academic Intelligence
                    </p>

                    <h2 className="mt-6 text-2xl font-semibold text-white">
                        {isLogin
                            ? "Welcome Back"
                            : "Create Account"}
                    </h2>

                </div>

                {/* Login/Register switch */}
                <div className="flex bg-[#1a1d22] rounded-xl p-1 mb-8 border border-[#b68c24]/20">

                    <button
                        onClick={() =>
                            setIsLogin(true)
                        }
                        className={`flex-1 py-3 rounded-lg transition-all font-medium
                        ${
                            isLogin
                                ? "bg-[#b68c24] text-black"
                                : "text-gray-400"
                        }`}
                    >
                        Login
                    </button>

                    <button
                        onClick={() =>
                            setIsLogin(false)
                        }
                        className={`flex-1 py-3 rounded-lg transition-all font-medium
                        ${
                            !isLogin
                                ? "bg-[#b68c24] text-black"
                                : "text-gray-400"
                        }`}
                    >
                        Register
                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Email */}
                    <div>

                        <label className="text-xs uppercase tracking-wider text-gray-400 block mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            placeholder="yourid@ietlucknow.ac.in"
                            required
                            className="w-full rounded-xl bg-[#1a1d22] border border-[#2c3138] px-4 py-3 text-white outline-none focus:border-[#b68c24]"
                        />

                    </div>

                    {/* Password */}
                    <div>

                        <label className="text-xs uppercase tracking-wider text-gray-400 block mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="••••••••"
                            required
                            className="w-full rounded-xl bg-[#1a1d22] border border-[#2c3138] px-4 py-3 text-white outline-none focus:border-[#b68c24]"
                        />

                    </div>

                    {/* Registration note */}
                    {!isLogin && (
                        <div className="text-xs text-center text-gray-400 border border-[#b68c24]/20 bg-[#1a1d22] rounded-xl p-3">
                            Role is detected automatically
                            from your IET institutional email.
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-sm rounded-xl p-3 text-center bg-red-500/10 border border-red-500/20 text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-[#b68c24] hover:scale-[1.02] transition-all text-black font-semibold"
                    >
                        {loading
                            ? "Processing..."
                            : isLogin
                            ? "Sign In"
                            : "Create Account"}
                    </button>

                </form>

            </div>

        </div>
    );
}