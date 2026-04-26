import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Settings, Challenge, LearningMode } from './types';

interface AppState {
  settings: Settings;
  messages: Message[];
  currentChallenge: Challenge | null;
  completedChallenges: string[];
  mode: LearningMode;
  code: string;
  isLoading: boolean;
  xp: number;
  streak: number;
  lastStudyDate: string;

  setSettings: (s: Partial<Settings>) => void;
  addMessage: (m: Message) => void;
  clearMessages: () => void;
  setChallenge: (c: Challenge | null) => void;
  completeChallenge: (id: string) => void;
  setMode: (m: LearningMode) => void;
  setCode: (c: string) => void;
  setLoading: (v: boolean) => void;
  addXP: (n: number) => void;
  updateStreak: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: {
        apiKey: '',
        apiProvider: 'groq',
        selectedLanguage: 'python',
        difficulty: 'beginner',
      },
      messages: [],
      currentChallenge: null,
      completedChallenges: [],
      mode: 'challenge',
      code: '',
      isLoading: false,
      xp: 0,
      streak: 0,
      lastStudyDate: '',

      setSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      addMessage: (m) =>
        set((state) => ({ messages: [...state.messages, m] })),

      clearMessages: () => set({ messages: [] }),

      setChallenge: (c) =>
        set({ currentChallenge: c, code: c?.starterCode ?? '' }),

      completeChallenge: (id) =>
        set((state) => ({
          completedChallenges: state.completedChallenges.includes(id)
            ? state.completedChallenges
            : [...state.completedChallenges, id],
        })),

      setMode: (m) => set({ mode: m }),
      setCode: (c) => set({ code: c }),
      setLoading: (v) => set({ isLoading: v }),
      addXP: (n) => set((state) => ({ xp: state.xp + n })),

      updateStreak: () => {
        const today = new Date().toDateString();
        const { lastStudyDate, streak } = get();
        if (lastStudyDate === today) return;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = lastStudyDate === yesterday ? streak + 1 : 1;
        set({ streak: newStreak, lastStudyDate: today });
      },
    }),
    { name: 'code-learner-store' }
  )
);
