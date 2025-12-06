import { create } from 'zustand';
import type { ChatMessage, Feedback } from '@/types';

interface InterviewState {
    sessionId: string | null;
    messages: ChatMessage[];
    currentQuestion: string;
    feedback: Feedback | null;
    allFeedbacks: Feedback[];
    recording: boolean;
    websocketConnected: boolean;
    timer: number;
    isEvaluating: boolean;

    // Actions
    setSessionId: (id: string) => void;
    addMessage: (message: ChatMessage) => void;
    updateMessage: (id: string, content: string) => void;
    setCurrentQuestion: (question: string) => void;
    setFeedback: (feedback: Feedback) => void;
    setRecording: (recording: boolean) => void;
    setWebsocketConnected: (connected: boolean) => void;
    setTimer: (seconds: number) => void;
    decrementTimer: () => void;
    setIsEvaluating: (evaluating: boolean) => void;
    reset: () => void;
}

const initialState = {
    sessionId: null,
    messages: [],
    currentQuestion: '',
    feedback: null,
    allFeedbacks: [],
    recording: false,
    websocketConnected: false,
    timer: 0,
    isEvaluating: false,
};

export const useInterviewStore = create<InterviewState>((set) => ({
    ...initialState,

    setSessionId: (id) => set({ sessionId: id }),

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message]
        })),

    updateMessage: (id, content) =>
        set((state) => ({
            messages: state.messages.map((msg) =>
                msg.id === id ? { ...msg, message: content, streaming: false } : msg
            ),
        })),

    setCurrentQuestion: (question) => set({ currentQuestion: question }),

    setFeedback: (feedback) =>
        set((state) => ({
            feedback,
            allFeedbacks: [...state.allFeedbacks, feedback]
        })),

    setRecording: (recording) => set({ recording }),

    setWebsocketConnected: (connected) => set({ websocketConnected: connected }),

    setTimer: (seconds) => set({ timer: seconds }),

    decrementTimer: () =>
        set((state) => ({ timer: Math.max(0, state.timer - 1) })),

    setIsEvaluating: (evaluating) => set({ isEvaluating: evaluating }),

    reset: () => set(initialState),
}));
