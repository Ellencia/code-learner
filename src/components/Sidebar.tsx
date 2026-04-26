import { Flame, Star, Trophy, BookOpen, Code2, Brain, Settings, BookMarked, TrendingUp, Map, Target } from 'lucide-react';
import { useStore } from '../store';
import { LANGUAGE_LABELS, LANGUAGE_ICONS, type Language, type LearningMode } from '../types';

interface Props {
  onOpenSettings: () => void;
}

export default function Sidebar({ onOpenSettings }: Props) {
  const { settings, setSettings, mode, setMode, xp, streak, completedChallenges, todayCompleted } = useStore();

  const languages: Language[] = ['python', 'java', 'javascript', 'react', 'typescript', 'cpp'];
  const modes: { id: LearningMode; label: string; icon: React.ReactNode }[] = [
    { id: 'challenge',  label: '코딩 챌린지',  icon: <Code2 size={16} /> },
    { id: 'curriculum', label: '학습 경로',    icon: <Map size={16} /> },
    { id: 'learn',      label: 'AI 개념 학습', icon: <BookOpen size={16} /> },
    { id: 'quiz',       label: 'AI 튜터 채팅', icon: <Brain size={16} /> },
    { id: 'notes',      label: '오답 노트',    icon: <BookMarked size={16} /> },
    { id: 'stats',      label: '학습 통계',    icon: <TrendingUp size={16} /> },
  ];

  const dailyGoal = settings.dailyGoal ?? 3;
  const goalProgress = Math.min(todayCompleted, dailyGoal);
  const goalPct = Math.round((goalProgress / dailyGoal) * 100);
  const goalDone = goalProgress >= dailyGoal;

  return (
    <aside className="hidden md:flex w-64 bg-[#1a1d2e] border-r border-white/5 flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎓</span>
          <h1 className="text-white font-bold text-lg">CodeLearner</h1>
        </div>
        <p className="text-gray-500 text-xs">AI 기반 코딩 학습</p>
      </div>

      {/* Stats */}
      <div className="flex gap-2 px-3 py-2.5 border-b border-white/5">
        <div className="flex-1 bg-[#1e2235] rounded-lg py-1.5 px-1 text-center">
          <div className="flex items-center justify-center gap-0.5 text-orange-400 mb-0.5">
            <Flame size={11} />
            <span className="text-sm font-bold text-white">{streak}</span>
          </div>
          <p className="text-gray-500 text-[10px]">연속 학습</p>
        </div>
        <div className="flex-1 bg-[#1e2235] rounded-lg py-1.5 px-1 text-center">
          <div className="flex items-center justify-center gap-0.5 text-yellow-400 mb-0.5">
            <Star size={11} />
            <span className="text-sm font-bold text-white">{xp}</span>
          </div>
          <p className="text-gray-500 text-[10px]">XP</p>
        </div>
        <div className="flex-1 bg-[#1e2235] rounded-lg py-1.5 px-1 text-center">
          <div className="flex items-center justify-center gap-0.5 text-green-400 mb-0.5">
            <Trophy size={11} />
            <span className="text-sm font-bold text-white">{completedChallenges.length}</span>
          </div>
          <p className="text-gray-500 text-[10px]">완료</p>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="px-3 py-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1 text-gray-500 text-[10px]">
            <Target size={10} /> 오늘 목표
          </span>
          <span className={`text-[10px] font-medium ${goalDone ? 'text-green-400' : 'text-gray-400'}`}>
            {goalProgress}/{dailyGoal} {goalDone ? '🎉' : ''}
          </span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${goalDone ? 'bg-green-400' : 'bg-indigo-500'}`}
            style={{ width: `${goalPct}%` }}
          />
        </div>
      </div>

      {/* Mode */}
      <div className="p-4 border-b border-white/5">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">학습 모드</p>
        <div className="space-y-1">
          {modes.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                mode === id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#1e2235]'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">언어 선택</p>
        <div className="space-y-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSettings({ selectedLanguage: lang })}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                settings.selectedLanguage === lang
                  ? 'bg-[#2a2f45] text-white border border-indigo-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-[#1e2235]'
              }`}
            >
              <span>{LANGUAGE_ICONS[lang]}</span>
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>

      </div>

      {/* Settings button */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
            !useStore.getState().settings.apiKey
              ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
              : 'text-gray-400 hover:text-white hover:bg-[#1e2235]'
          }`}
        >
          <Settings size={16} />
          {useStore.getState().settings.apiKey ? 'API 설정' : '⚠️ API 키 필요'}
        </button>
      </div>
    </aside>
  );
}
