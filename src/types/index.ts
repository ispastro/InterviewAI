// Chat and Message Types
export interface ChatMessage {
    id: string;
    sender: 'user' | 'interviewer';
    message: string;
    timestamp: Date;
    streaming?: boolean;
}

// Feedback Types
export interface ScoreBreakdown {
    communication: number; // 1-5
    confidence: number;
    structure: number;
    technicalDepth: number;
    relevance: number;
}

export interface Feedback {
    id: string;
    questionId: string;
    scores: ScoreBreakdown;
    strengths: string[];
    improvements: string[];
    modelAnswer?: string;
}

// Session Types
export interface InterviewSession {
    id: string;
    userId: string;
    role: string;
    difficulty: 'easy' | 'medium' | 'hard';
    style: 'friendly' | 'neutral' | 'strict';
    mode: 'text' | 'voice';
    duration: number;
    startedAt: Date;
    endedAt?: Date;
    overallScore?: number;
    messages: ChatMessage[];
    feedbacks: Feedback[];
}

// User Types
export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

// Settings Types
export interface InterviewSettings {
    selectedRole: string;
    difficulty: 'easy' | 'medium' | 'hard';
    interviewStyle: 'friendly' | 'neutral' | 'strict';
    mode: 'text' | 'voice';
    duration: 5 | 10 | 20;
}

// Session History for Dashboard
export interface SessionSummary {
    id: string;
    role: string;
    date: Date;
    overallScore: number;
    scores: ScoreBreakdown;
    questionsAnswered: number;
}

// WebSocket Event Types
export type WebSocketEventType =
    | 'interviewer_message'
    | 'evaluation_result'
    | 'followup_question'
    | 'session_end'
    | 'connection_status';

export interface WebSocketEvent {
    type: WebSocketEventType;
    payload: unknown;
}
