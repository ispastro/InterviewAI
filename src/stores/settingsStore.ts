import { create } from 'zustand';
import type { InterviewSettings } from '@/types';

interface SettingsState extends InterviewSettings {
    // Actions
    setSelectedRole: (role: string) => void;
    setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
    setInterviewStyle: (style: 'friendly' | 'neutral' | 'strict') => void;
    setMode: (mode: 'text' | 'voice') => void;
    setDuration: (duration: 5 | 10 | 20) => void;
    setSettings: (settings: Partial<InterviewSettings>) => void;
    reset: () => void;
}

const defaultSettings: InterviewSettings = {
    selectedRole: 'Software Engineer',
    difficulty: 'medium',
    interviewStyle: 'neutral',
    mode: 'text',
    duration: 10,
};

export const useSettingsStore = create<SettingsState>((set) => ({
    ...defaultSettings,

    setSelectedRole: (role) => set({ selectedRole: role }),

    setDifficulty: (difficulty) => set({ difficulty }),

    setInterviewStyle: (style) => set({ interviewStyle: style }),

    setMode: (mode) => set({ mode }),

    setDuration: (duration) => set({ duration }),

    setSettings: (settings) => set(settings),

    reset: () => set(defaultSettings),
}));
