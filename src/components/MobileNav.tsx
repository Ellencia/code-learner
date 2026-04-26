import { Code2, BookOpen, Brain, BookMarked, TrendingUp, Menu } from 'lucide-react';
import { useStore } from '../store';
import type { LearningMode } from '../types';

interface Props {
  onOpenSettings: () => void;
  onOpenDrawer: () => void;
}

const MODES: { id: LearningMode; label: string; icon: React.ReactNode }[] = [
  { id: 'challenge', label: '챌린지', icon: <Code2 size={20} /> },
  { id: 'learn',     label: '학습',   icon: <BookOpen size={20} /> },
  { id: 'quiz',      label: '튜터',   icon: <Brain size={20} /> },
  { id: 'notes',     label: '노트',   icon: <BookMarked size={20} /> },
  { id: 'stats',     label: '통계',   icon: <TrendingUp size={20} /> },
];

export default function MobileNav({ onOpenDrawer }: Props) {
  const { mode, setMode } = useStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1d2e] border-t border-white/10"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-14">
        {MODES.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[48px] ${
              mode === id ? 'text-indigo-400' : 'text-gray-500 active:text-gray-300'
            }`}
          >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-gray-500 active:text-gray-300 min-w-[48px]"
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">더보기</span>
        </button>
      </div>
    </nav>
  );
}
