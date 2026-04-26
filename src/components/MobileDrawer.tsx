import { X, Flame, Star, Trophy, Settings } from 'lucide-react';
import { useStore } from '../store';
import { LANGUAGE_LABELS, LANGUAGE_ICONS, type Language } from '../types';

interface Props {
  onClose: () => void;
  onOpenSettings: () => void;
}

const LANGUAGES: Language[] = ['python', 'java', 'javascript', 'react', 'typescript', 'cpp'];

export default function MobileDrawer({ onClose, onOpenSettings }: Props) {
  const { settings, setSettings, xp, streak, completedChallenges } = useStore();

  return (
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1d2e] rounded-t-2xl"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-white font-semibold">언어 & 난이도</h3>
          <button onClick={onClose} className="text-gray-400 active:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 px-4 py-3 border-b border-white/5">
          <div className="flex-1 flex items-center gap-2 bg-[#1e2235] rounded-xl px-3 py-2">
            <Flame size={14} className="text-orange-400" />
            <span className="text-white font-bold">{streak}</span>
            <span className="text-gray-500 text-xs">연속</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-[#1e2235] rounded-xl px-3 py-2">
            <Star size={14} className="text-yellow-400" />
            <span className="text-white font-bold">{xp}</span>
            <span className="text-gray-500 text-xs">XP</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-[#1e2235] rounded-xl px-3 py-2">
            <Trophy size={14} className="text-green-400" />
            <span className="text-white font-bold">{completedChallenges.length}</span>
            <span className="text-gray-500 text-xs">완료</span>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Language */}
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">언어</p>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setSettings({ selectedLanguage: lang }); }}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                    settings.selectedLanguage === lang
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#1e2235] text-gray-400 active:bg-[#252840]'
                  }`}
                >
                  <span className="text-xl">{LANGUAGE_ICONS[lang]}</span>
                  <span className="text-xs">{LANGUAGE_LABELS[lang]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">난이도</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'beginner', label: '초급', emoji: '🌱', color: 'text-green-400' },
                { id: 'intermediate', label: '중급', emoji: '🔥', color: 'text-yellow-400' },
                { id: 'advanced', label: '고급', emoji: '⚡', color: 'text-red-400' },
              ] as const).map(({ id, label, emoji }) => (
                <button
                  key={id}
                  onClick={() => setSettings({ difficulty: id })}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    settings.difficulty === id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#1e2235] text-gray-400 active:bg-[#252840]'
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* API 설정 */}
        <div className="px-4 pb-4 pt-2 border-t border-white/5">
          <button
            onClick={() => { onClose(); onOpenSettings(); }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              useStore.getState().settings.apiKey
                ? 'bg-[#1e2235] text-gray-400 active:bg-[#252840]'
                : 'bg-yellow-400/10 text-yellow-400 active:bg-yellow-400/20'
            }`}
          >
            <Settings size={15} />
            {useStore.getState().settings.apiKey ? 'API 설정' : '⚠️ API 키 필요'}
          </button>
        </div>
      </div>
    </>
  );
}
