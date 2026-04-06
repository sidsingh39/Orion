export interface Message {
    role: 'user' | 'ai' | 'assistant';
    content: string;
    created_at?: string;
}

export interface Session {
    id: string;
    title: string;
    user_id: string;
    created_at: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface Upload {
    filename: string;
    type: string;
    timestamp: string;
    file_url: string;

    // Trust-aware metadata
    trust_score?: number;
    trust_message?: string;
    verified?: boolean;

    // Optional preview content
    chunk_text?: string;
}