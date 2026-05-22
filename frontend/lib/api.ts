import axios from "axios";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export const uploadApi = {
  getUploads: () => api.get("/api/uploads"),

  uploadFile: (formData: FormData) =>
    api.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteUpload: (filename: string) =>
    api.delete(`/api/upload/${encodeURIComponent(filename)}`),
};

export const chatApi = {
  getSessions: () => api.get("/api/sessions"),

  getSession: (sessionId: string) => api.get(`/api/sessions/${sessionId}`),

  createSession: (title: string) => api.post("/api/sessions", { title }),

  deleteSession: (sessionId: string) =>
    api.delete(`/api/sessions/${sessionId}`),

  getLatestNotices: () => api.get("/api/notices/latest"),
  getNoticeById: (id: string) => api.get(`/api/notices/${id}`),
};

export const quizApi = {
  generateQuiz: (payload: any) => api.post("/api/quiz", payload),

  submitQuiz: (payload: any) => api.post("/api/quiz/submit", payload),
};

export default api;
