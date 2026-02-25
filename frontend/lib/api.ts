import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
    const { supabase } = await import("@/lib/supabase");
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
});

export const chatApi = {
    getSessions: () => api.get("/api/sessions"),
    getSession: (id: string) => api.get(`/api/sessions/${id}`),
    createSession: (title: string) => api.post("/api/sessions", { title }),
    deleteSession: (id: string) => api.delete(`/api/sessions/${id}`),
};

export const uploadApi = {
    getUploads: () => api.get("/api/uploads"),
    uploadFile: (formData: FormData) => api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }),
    deleteUpload: (filename: string) => api.delete(`/api/upload/${encodeURIComponent(filename)}`),
};

export const quizApi = {
    generateQuiz: (topic: string) => api.post("/api/quiz", { topic }),
};

export default api;
