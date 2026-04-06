"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import {
  Brain,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "@/types";
import { quizApi } from "@/lib/api";
import { toast } from "sonner";

const Auth = dynamic(() => import("@/components/Auth"), { ssr: false });

export default function QuizPage() {
  // Authentication state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Quiz state
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Restore existing session
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

  // Login callback
  const handleLogin = (newToken: string, username: string) => {
    setToken(newToken);
    setUser(username);
  };

  // Logout callback
  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    setQuizData(null);
  };

  // Generate quiz from topic
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

      toast.success("Quiz generated successfully.", {
        id: loadingToast,
      });
    } catch (err) {
      console.error("Failed to generate quiz", err);

      toast.error("Failed to generate quiz. System interference detected.", {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Select answer
  const handleOptionSelect = (qIndex: number, option: string) => {
    if (showResults) return;

    setUserAnswers((prev) => ({
      ...prev,
      [qIndex]: option,
    }));
  };

  // Calculate score
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

  // Loading auth screen
  if (isAuthLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-[#b68c24] animate-pulse text-lg tracking-[0.18em] uppercase font-semibold">
          ORION Initializing...
        </div>
      </div>
    );
  }

  // Auth gate
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
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">

      {/* Navigation */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Quiz Area */}
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">

        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[rgba(182,140,36,0.10)] text-[#b68c24] ring-1 ring-[rgba(182,140,36,0.18)] mb-4">
            <Brain size={30} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2a2118] dark:text-[#f5efe2]">
            AI Quiz Generator
          </h1>

          <p className="text-[#6d6255] dark:text-[#b8ab98] text-lg max-w-xl mx-auto leading-relaxed">
            Generate intelligent assessments on any topic and evaluate understanding with ORION’s guided knowledge engine.
          </p>
        </div>

        {/* Topic Input */}
        {!quizData && !isLoading && (
          <div className="rounded-3xl p-8 bg-[rgba(255,250,240,0.86)] dark:bg-[rgba(26,29,34,0.88)] border border-[rgba(182,140,36,0.14)] backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.30)]">
            <label className="block text-sm font-medium text-[#7a6640] dark:text-[#caa84a] mb-3 ml-1 tracking-[0.12em] uppercase">
              Quiz Topic
            </label>

            <div className="flex gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerateQuiz()}
                placeholder="e.g. Photosynthesis, World War II, Calculus..."
                className="flex-1 rounded-2xl px-5 py-4 text-lg bg-[rgba(255,252,246,0.85)] dark:bg-[#14171c] border border-[rgba(182,140,36,0.12)] outline-none focus:ring-2 focus:ring-[rgba(182,140,36,0.28)] placeholder:text-[#9b8f7e] dark:placeholder:text-[#6b6258]"
              />

              <Button
                onClick={handleGenerateQuiz}
                disabled={!topic.trim()}
                className="h-auto px-8 rounded-2xl bg-[#b68c24] hover:bg-[#d4af37] text-black font-medium shadow-none"
              >
                Generate
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20 space-y-4 animate-in fade-in zoom-in duration-500">
            <Loader2 className="animate-spin mx-auto text-[#b68c24]" size={44} />
            <p className="text-lg text-[#6d6255] dark:text-[#c9b9a3] font-medium">
              Generating assessment...
            </p>
            <p className="text-sm text-[#9b8f7e] dark:text-[#7a7167]">
              ORION is structuring your topic into measurable understanding.
            </p>
          </div>
        )}

        {/* Quiz */}
        {quizData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Score Card */}
            {showResults && (
              <div className="rounded-3xl p-6 text-center border border-[rgba(182,140,36,0.16)] bg-[rgba(182,140,36,0.06)] dark:bg-[rgba(182,140,36,0.08)]">
                <Trophy className="mx-auto text-[#d4af37] mb-3" size={38} />

                <h2 className="text-3xl font-bold text-[#2a2118] dark:text-[#f5efe2] mb-1">
                  You scored {score} / {quizData.length}
                </h2>

                <p className="text-[#7a6640] dark:text-[#caa84a]">
                  {score === quizData.length
                    ? "Perfect score. Excellent command."
                    : score > quizData.length / 2
                      ? "Strong performance. Keep refining."
                      : "Good effort. Try another round."}
                </p>

                <Button
                  onClick={() => setQuizData(null)}
                  variant="outline"
                  className="mt-6 border-[rgba(182,140,36,0.22)] text-[#8a6a22] dark:text-[#d4af37] hover:bg-[rgba(182,140,36,0.08)]"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Try Another Topic
                </Button>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {quizData.map((q, qIdx) => {
                return (
                  <div
                    key={qIdx}
                    className="rounded-3xl p-6 md:p-8 bg-[rgba(255,250,240,0.84)] dark:bg-[rgba(26,29,34,0.88)] border border-[rgba(182,140,36,0.12)]"
                  >
                    <h3 className="text-xl font-semibold text-[#2a2118] dark:text-[#f5efe2] mb-6 flex items-start gap-3">
                      <span className="text-[#b68c24]">0{qIdx + 1}.</span>
                      {q.question}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((option, oIdx) => {
                        const isSelected = userAnswers[qIdx] === option;
                        const showCorrect = showResults && option === q.answer;
                        const showWrong = showResults && isSelected && option !== q.answer;

                        let btnClass =
                          "bg-transparent border-[rgba(182,140,36,0.10)] text-foreground hover:bg-[rgba(182,140,36,0.04)]";

                        if (showCorrect) {
                          btnClass =
                            "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300";
                        } else if (showWrong) {
                          btnClass =
                            "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300";
                        } else if (isSelected) {
                          btnClass =
                            "bg-[rgba(182,140,36,0.08)] border-[rgba(182,140,36,0.26)] text-[#8a6a22] dark:text-[#d4af37]";
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleOptionSelect(qIdx, option)}
                            disabled={showResults}
                            className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${btnClass}`}
                          >
                            <span>{option}</span>
                            {showCorrect && <CheckCircle size={18} />}
                            {showWrong && <XCircle size={18} />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showResults && q.explanation && (
                      <div className="mt-6 p-5 rounded-2xl bg-[rgba(182,140,36,0.05)] border border-[rgba(182,140,36,0.12)]">
                        <div className="flex items-center gap-2 mb-2 text-[#8a6a22] dark:text-[#d4af37] font-semibold text-sm uppercase tracking-[0.14em]">
                          <Brain size={15} />
                          Insight
                        </div>

                        <p className="text-sm leading-relaxed text-[#5f5548] dark:text-[#c3b6a5]">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit */}
            {!showResults && (
              <div className="flex justify-end pt-4">
                <Button
                  onClick={calculateScore}
                  disabled={Object.keys(userAnswers).length < quizData.length}
                  className="bg-[#b68c24] hover:bg-[#d4af37] text-black px-8 py-6 text-lg rounded-2xl"
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