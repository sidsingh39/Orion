"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Auth({
  onLogin,
}: {
  onLogin: (token: string, username: string) => void;
}) {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [designation, setDesignation] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [loading, setLoading] = useState(false);

  const departments = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Mechanical Engineering",
    "Chemical Engineering",
  ];

  const cseBranches = ["CSE-R", "CSE-AI", "CSE-SF"];

  const programs = ["B.Tech", "M.Tech", "MBA", "MCA", "PhD"];

  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const sections = ["A", "B", "C", "D"];

  const detectRole = (email: string) => {
    const domain = "@ietlucknow.ac.in";

    if (!email.endsWith(domain)) {
      throw new Error("Please use institutional email");
    }

    const prefix = email.split("@")[0];

    return /^\d+$/.test(prefix) ? "student" : "faculty";
  };

  const detectedRole =
    email.length > 0
      ? (() => {
          try {
            return detectRole(email);
          } catch {
            return "";
          }
        })()
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          onLogin(data.session.access_token, data.user.email || email);
        }
      } else {
        const role = detectRole(email);

        const metadata: any = {
          name,
          role,
          department,
          branch,
        };

        if (role === "student") {
          metadata.program = program;

          metadata.semester = semester;

          metadata.section = section;
        }

        if (role === "faculty") {
          metadata.designation = designation;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,

          options: {
            data: metadata,
          },
        });

        if (error) throw error;

        if (data?.user) {
          const { error: dbError } = await supabase.from("users").insert({
            id: data.user.id,

            name,
            email,

            role,
            role_type: role,

            department,

            branch: role === "student" ? branch : null,

            program: role === "student" ? program : null,

            semester: role === "student" ? semester : null,

            section: role === "student" ? section : null,

            designation: role === "faculty" ? designation : null,
          });

          if (dbError) throw dbError;
        }

        setMessage("Registration successful. Please login to continue.");

        setMessageType("success");

        setIsLogin(true);
      }
    } catch (err: any) {
      setMessage(err.message || "Authentication failed");

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
w-full
max-w-lg
max-h-[90vh]
overflow-y-auto
p-8
rounded-3xl
bg-[#0f1115]/95
border
border-[#b68c24]/20
shadow-2xl
"
    >
      <div className="text-center mb-8">
        <h1 className="text-5xl text-white font-bold">ORION</h1>

        <p className="text-[#b68c24] tracking-[0.3em] mt-2 text-sm uppercase">
          Academic Intelligence
        </p>

        <h2 className="text-white text-2xl mt-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
      </div>

      <div className="flex rounded-xl bg-[#1a1d22] p-1 mb-8">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-3 rounded-lg ${
            isLogin ? "bg-[#b68c24] text-black" : "text-gray-400"
          }`}
        >
          Login
        </button>

        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-3 rounded-lg ${
            !isLogin ? "bg-[#b68c24] text-black" : "text-gray-400"
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl bg-[#1a1d22] p-3 text-white"
          />
        )}

        <input
          placeholder="Institution Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl bg-[#1a1d22] p-3 text-white"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl bg-[#1a1d22] p-3 text-white"
        />

        {!isLogin && detectedRole && (
          <div className="text-center rounded-xl bg-[#1a1d22] border border-[#b68c24]/20 p-3">
            Detected Role:
            <span className="ml-2 text-[#b68c24]">{detectedRole}</span>
          </div>
        )}

        {!isLogin && (
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="w-full rounded-xl bg-[#1a1d22] p-3 text-white"
          >
            <option value="">Select Department</option>

            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        )}

        {!isLogin && department === "Computer Science & Engineering" && (
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
            className="w-full rounded-xl bg-[#1a1d22] p-3 text-white"
          >
            <option value="">Select Branch</option>

            {cseBranches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        )}

        {!isLogin && detectedRole === "student" && (
          <>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              required
              className="w-full rounded-xl bg-[#1a1d22] p-3 text-white"
            >
              <option value="">Program</option>

              {programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>

            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
              className="w-full rounded-xl bg-[#1a1d22] p-3 text-white"
            >
              <option value="">Semester</option>

              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>

            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
              className="w-full rounded-xl bg-[#1a1d22] p-3 text-white"
            >
              <option value="">Section</option>

              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </>
        )}

        {!isLogin && detectedRole === "faculty" && (
          <input
            placeholder="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
            className="w-full rounded-xl bg-[#1a1d22] p-3 text-white"
          />
        )}

        {message && (
          <div
            className={`p-3 rounded-xl text-center text-sm ${
              messageType === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {message}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-[#b68c24] text-black rounded-xl py-3 font-semibold hover:scale-[1.02] transition"
        >
          {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
