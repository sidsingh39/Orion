"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Brain, CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "@/types";
import { quizApi } from "@/lib/api";
import { toast } from "sonner";

const Auth = dynamic(() => import("@/components/Auth"), { ssr: false });

export default function QuizPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

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
    setQuizData(null);
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim() || !token) return;
    setIsLoading(true);
    const loadingToast = toast.loading("Synthesizing knowledge into questions...");
    setQuizData(null);
    setShowResults(false);
    setUserAnswers({});
    setScore(0);

    try {
      const res = await quizApi.generateQuiz(topic);
      setQuizData(res.data.quiz);
      toast.success("Quiz generated! Initiating assessment.", { id: loadingToast });
    } catch (err) {
      console.error("Failed to generate quiz", err);
      toast.error("Failed to generate quiz. System interference detected.", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (qIndex: number, option: string) => {
    if (showResults) return; // Prevent changing after submit
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const calculateScore = () => {
    if (!quizData) return;
    let newScore = 0;
    quizData.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        newScore++;
      }
    });
    setScore(newScore);
    setShowResults(true);
  };

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
        <div className="relative z-10 w-full max-w-md">
          <Auth onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans bg-[#020817] text-slate-100">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">

        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-500/10 text-cyan-400 mb-4 ring-1 ring-cyan-500/20">
            <Brain size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-500">
            AI Quiz Generator
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Test your knowledge! Enter a topic below (e.g., "Quantum Physics" or "File Uploads") and we'll generate a quiz for you.
          </p>
        </div>

        {/* Input Section */}
        {!quizData && !isLoading && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            <label className="block text-sm font-medium text-slate-300 mb-3 ml-1">
              Quiz Topic
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerateQuiz()}
                placeholder="e.g. Photosynthesis, World War II, Calculus..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
              />
              <Button
                onClick={handleGenerateQuiz}
                disabled={!topic.trim()}
                className="h-auto px-8 text-lg bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all shadow-lg shadow-cyan-900/20"
              >
                Generate
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20 space-y-4 animate-in fade-in zoom-in duration-500">
            <Loader2 className="animate-spin mx-auto text-cyan-400" size={48} />
            <p className="text-xl text-slate-300 font-medium">Analyzing topic & generating questions...</p>
            <p className="text-sm text-slate-500">This connects to your uploaded documents via RAG.</p>
          </div>
        )}

        {/* Quiz Interface */}
        {quizData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Score Card */}
            {showResults && (
              <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-2xl p-6 text-center shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                <Trophy className="mx-auto text-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" size={40} />
                <h2 className="text-3xl font-bold text-white mb-1">
                  You scored {score} / {quizData.length}
                </h2>
                <p className="text-cyan-200">
                  {score === quizData.length ? "Perfect score! Outstanding!" : score > quizData.length / 2 ? "Great job! Keep learning." : "Good effort! Try again to improve."}
                </p>
                <Button onClick={() => setQuizData(null)} variant="outline" className="mt-6 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20">
                  <RefreshCw size={16} className="mr-2" /> Try Another Topic
                </Button>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {quizData.map((q, qIdx) => {
                const isCorrect = userAnswers[qIdx] === q.answer;
                const isWrong = showResults && userAnswers[qIdx] !== q.answer && userAnswers[qIdx] !== undefined;

                return (
                  <div key={qIdx} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm transition-all hover:border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-start gap-3">
                      <span className="text-cyan-500/80 text-lg mt-0.5">0{qIdx + 1}.</span>
                      {q.question}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((option, oIdx) => {
                        const isSelected = userAnswers[qIdx] === option;
                        const showCorrect = showResults && option === q.answer;
                        const showWrong = showResults && isSelected && option !== q.answer;

                        let btnClass = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20";

                        if (showCorrect) {
                          btnClass = "bg-green-500/20 border-green-500/50 text-green-200 ring-1 ring-green-500/50";
                        } else if (showWrong) {
                          btnClass = "bg-red-500/20 border-red-500/50 text-red-200 ring-1 ring-red-500/50";
                        } else if (isSelected) {
                          btnClass = "bg-cyan-600/30 border-cyan-500 text-white ring-1 ring-cyan-500/50";
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleOptionSelect(qIdx, option)}
                            disabled={showResults}
                            className={`
                                                w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center justify-between
                                                ${btnClass}
                                            `}
                          >
                            <span>{option}</span>
                            {showCorrect && <CheckCircle size={18} className="text-green-400" />}
                            {showWrong && <XCircle size={18} className="text-red-400" />}
                          </button>
                        );
                      })}
                    </div>

                    {showResults && q.explanation && (
                      <div className="mt-6 p-5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold text-sm uppercase tracking-wider">
                          <Brain size={16} /> Insight
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            {!showResults && (
              <div className="flex justify-end pt-4">
                <Button
                  onClick={calculateScore}
                  disabled={Object.keys(userAnswers).length < quizData.length}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-900/40 transition-all hover:scale-105"
                >
                  Submit Quiz <ArrowRight className="ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
