import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Settings, Challenge, LearningMode, WrongNote, Snippet } from './types';
import type { Language } from './types';

interface AppState {
  settings: Settings;
  messages: Message[];
  currentChallenge: Challenge | null;
  completedChallenges: string[];
  savedChallenges: Challenge[];
  wrongNotes: WrongNote[];
  snippets: Snippet[];
  // 날짜별 학습 횟수: "2026-04-26" → 횟수
  studyLog: Record<string, number>;
  // 최근 10회 챌린지 결과 (true=정답)
  recentResults: boolean[];
  mode: LearningMode;
  code: string;
  isLoading: boolean;
  xp: number;
  streak: number;
  lastStudyDate: string;

  curriculumProgress: Record<string, string[]>;
  todayCompleted: number;
  lastCompletedDate: string;

  setSettings: (s: Partial<Settings>) => void;
  addMessage: (m: Message) => void;
  clearMessages: () => void;
  setChallenge: (c: Challenge | null) => void;
  completeChallenge: (id: string) => void;
  saveChallenge: (c: Challenge) => void;
  addWrongNote: (note: WrongNote) => void;
  deleteWrongNote: (id: string) => void;
  addSnippet: (s: Snippet) => void;
  deleteSnippet: (id: string) => void;
  logStudy: () => void;
  recordResult: (correct: boolean) => void;
  completeCurriculumTopic: (lang: Language, topicId: string) => void;
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
        editorFontSize: 13,
        soundEnabled: true,
        dailyGoal: 3,
      },
      messages: [],
      currentChallenge: null,
      completedChallenges: [],
      savedChallenges: [],
      wrongNotes: [],
      snippets: [],
      studyLog: {},
      recentResults: [],
      curriculumProgress: {},
      todayCompleted: 0,
      lastCompletedDate: '',
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
        set((state) => {
          if (state.completedChallenges.includes(id)) return {};
          const today = new Date().toDateString();
          const isNewDay = state.lastCompletedDate !== today;
          return {
            completedChallenges: [...state.completedChallenges, id],
            todayCompleted: isNewDay ? 1 : state.todayCompleted + 1,
            lastCompletedDate: today,
          };
        }),

      saveChallenge: (c) =>
        set((state) => {
          if (state.savedChallenges.some(s => s.id === c.id)) return {};
          return { savedChallenges: [c, ...state.savedChallenges].slice(0, 100) };
        }),

      addWrongNote: (note) =>
        set((state) => {
          const filtered = state.wrongNotes.filter(n => n.id !== note.id);
          return { wrongNotes: [note, ...filtered].slice(0, 200) };
        }),

      deleteWrongNote: (id) =>
        set((state) => ({ wrongNotes: state.wrongNotes.filter(n => n.id !== id) })),

      addSnippet: (s) =>
        set((state) => ({ snippets: [s, ...state.snippets].slice(0, 200) })),

      deleteSnippet: (id) =>
        set((state) => ({ snippets: state.snippets.filter(s => s.id !== id) })),

      logStudy: () => {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        set((state) => ({
          studyLog: {
            ...state.studyLog,
            [today]: (state.studyLog[today] ?? 0) + 1,
          },
        }));
      },

      recordResult: (correct) =>
        set((state) => ({
          recentResults: [...state.recentResults, correct].slice(-10),
        })),

      completeCurriculumTopic: (lang, topicId) =>
        set((state) => {
          const prev = state.curriculumProgress[lang] ?? [];
          if (prev.includes(topicId)) return {};
          return { curriculumProgress: { ...state.curriculumProgress, [lang]: [...prev, topicId] } };
        }),

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
