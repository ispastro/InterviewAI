import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface UserState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: User, token: string) => void;
    updateUser: (updates: Partial<User>) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setUser: (user, token) => set({
                user,
                token,
                isAuthenticated: true
            }),

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),

            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false
            }),
        }),
        {
            name: 'user-storage',
        }
    )
);
