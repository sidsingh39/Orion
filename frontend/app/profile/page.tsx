"use client";

import { useState, useEffect } from "react";
import Auth from "@/components/Auth";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function Profile() {

    const [token, setToken] =
        useState<string | null>(null);

    const [user, setUser] =
        useState<string | null>(null);

    const [fullName, setFullName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [userRole, setUserRole] =
        useState("Student");

    const [department, setDepartment] =
        useState("Unknown");

    useEffect(() => {

        const loadSession = async () => {

            const {
                data: { session }
            } = await supabase.auth.getSession();

            if (!session) return;

            loadUser(session);

        };

        loadSession();

        const {
            data: { subscription },
        } =
        supabase.auth.onAuthStateChange(
            (_event, session) => {

                if (session) {

                    loadUser(session);

                } else {

                    setToken(null);
                    setUser(null);

                }

            }
        );

        return () =>
            subscription.unsubscribe();

    }, []);

    const loadUser = (
        session: any
    ) => {

        const metadata =
            session.user.user_metadata || {};

        setToken(
            session.access_token
        );

        setUser(
            metadata.username ||
            session.user.email
            ?.split("@")[0] ||
            "User"
        );

        setFullName(
            metadata.name ||
            metadata.full_name ||
            metadata.username ||
            session.user.email
            ?.split("@")[0] ||
            "User"
        );

        setEmail(
            session.user.email || ""
        );

        setUserRole(
            metadata.role
            ? metadata.role.charAt(0)
            .toUpperCase() +
            metadata.role.slice(1)
            : "Student"
        );

        setDepartment(
            metadata.department ||
            metadata.program ||
            "Unknown"
        );

    };

    const login = (
        newToken: string,
        username: string
    ) => {

        setToken(newToken);

        setUser(username);

    };

    const logout = async () => {

        await supabase.auth.signOut();

        setToken(null);

        setUser(null);

    };

    return (

        <div className="
        min-h-screen
        bg-background
        text-foreground
        ">

            <Navbar
                user={user}
                onLogout={logout}
            />

            <main className="
            flex
            items-center
            justify-center
            min-h-[calc(100vh-100px)]
            px-4
            py-28
            ">

                {!token ? (

                    <Auth
                    onLogin={login}
                    />

                ) : (

                    <div className="
                    w-full
                    max-w-4xl
                    rounded-3xl
                    p-10
                    bg-[rgba(255,250,240,0.04)]
                    backdrop-blur-xl
                    border
                    border-[rgba(182,140,36,0.16)]
                    ">

                        <div className="
                        flex
                        flex-col
                        items-center
                        mb-10
                        ">

                            <div className="
                            w-28
                            h-28
                            rounded-full
                            border
                            border-[#d4af37]
                            flex
                            items-center
                            justify-center
                            text-4xl
                            mb-6
                            ">

                                👤

                            </div>

                            <h1 className="
                            text-4xl
                            font-bold
                            text-center
                            ">

                                Welcome,
                                {" "}
                                {fullName.toUpperCase()}

                            </h1>

                            <p className="
                            text-[#d4af37]
                            tracking-[0.2em]
                            uppercase
                            mt-2
                            ">

                                {userRole}
                                {" "}
                                Portal

                            </p>

                        </div>

                        <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-5
                        ">

                            <InfoCard
                                title="Name"
                                value={fullName}
                            />

                            <InfoCard
                                title="Email"
                                value={email}
                            />

                            <InfoCard
                                title="Role"
                                value={userRole}
                            />

                            <InfoCard
                                title="Department"
                                value={department}
                            />

                        </div>

                        <div className="
                        flex
                        justify-center
                        mt-10
                        ">

                            <button
                            onClick={logout}
                            className="
                            px-8
                            py-4
                            rounded-xl
                            border
                            border-[rgba(182,140,36,0.25)]
                            text-[#d4af37]
                            hover:bg-[rgba(182,140,36,0.08)]
                            transition-all
                            "
                            >

                                Terminate Session

                            </button>

                        </div>

                    </div>

                )}

            </main>

        </div>

    );

}

function InfoCard({
    title,
    value
}:{
    title:string;
    value:string;
}){

    return(

        <div className="
        p-5
        rounded-2xl
        bg-[#14171c]
        border
        border-[rgba(182,140,36,0.12)]
        ">

            <h3 className="
            text-xs
            uppercase
            tracking-[0.2em]
            text-[#d4af37]
            mb-3
            ">

                {title}

            </h3>

            <p className="
            break-words
            text-lg
            ">

                {value}

            </p>

        </div>

    );

}