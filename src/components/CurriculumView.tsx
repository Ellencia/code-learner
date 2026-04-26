import { useState } from 'react';
import { CheckCircle, Loader2, Lock, Play, Map } from 'lucide-react';
import { useStore } from '../store';
import { generateCurriculumChallenge } from '../api';
import { CURRICULUM, LANGUAGE_ICONS, LANGUAGE_LABELS } from '../types';

export default function CurriculumView() {
  const {
    settings, setSettings, curriculumProgress,
    setChallenge, saveChallenge, setMode, updateStreak, logStudy,
  } = useStore();
  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null);

  const lang = settings.selectedLanguage;
  const topics = CURRICULUM[lang] ?? [];
  const cleared = curriculumProgress[lang] ?? [];

  const startTopic = async (topicId: string, topicTitle: string) => {
    if (!settings.apiKey) { alert('먼저 Settings에서 API 키를 설정해주세요.'); return; }
    setLoadingTopicId(topicId);
    try {
      const c = await generateCurriculumChallenge(settings, lang, settings.difficulty, topicTitle);
      // 커리큘럼 출처 태그 저장
      setChallenge({ ...c, curriculumTopicId: topicId } as typeof c & { curriculumTopicId: string });
      saveChallenge(c);
      updateStreak();
      logStudy();
      setMode('challenge');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoadingTopicId(null);
    }
  };

  const totalCleared = cleared.length;
  const progressPct = topics.length ? Math.round((totalCleared / topics.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1a1d2e]">
        <div className="flex items-center gap-2">
          <Map size={16} className="text-indigo-400" />
          <h2 className="text-white font-semibold text-sm md:text-base">
            {LANGUAGE_ICONS[lang]} {LANGUAGE_LABELS[lang]} 학습 경로
          </h2>
        </div>
        {/* 난이도 */}
        <div className="flex items-center gap-1">
          {([
            { id: 'beginner', label: '초급', emoji: '🌱' },
            { id: 'intermediate', label: '중급', emoji: '🔥' },
            { id: 'advanced', label: '고급', emoji: '⚡' },
          ] as const).map(({ id, label, emoji }) => (
            <button key={id} onClick={() => setSettings({ difficulty: id })}
              className={`text-xs px-2 py-1 rounded-lg transition-all ${
                settings.difficulty === id ? 'bg-indigo-600 text-white' : 'bg-[#252840] text-gray-400 hover:text-white'
              }`}>
              <span className="hidden sm:inline">{emoji} </span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="px-4 py-3 border-b border-white/5 bg-[#1a1d2e]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-400 text-xs">{totalCleared} / {topics.length} 완료</span>
          <span className="text-indigo-400 text-xs font-medium">{progressPct}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 토픽 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {topics.map((topic, idx) => {
            const isCleared = cleared.includes(topic.id);
            const isLocked = idx > 0 && !cleared.includes(topics[idx - 1].id);
            const isLoading = loadingTopicId === topic.id;

            return (
              <div key={topic.id}
                className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isCleared
                    ? 'bg-indigo-600/10 border-indigo-500/30'
                    : isLocked
                    ? 'bg-white/2 border-white/5 opacity-50'
                    : 'bg-[#1e2235] border-white/5 hover:border-indigo-500/30'
                }`}>
                {/* 번호 / 상태 아이콘 */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  isCleared ? 'bg-indigo-500 text-white' : isLocked ? 'bg-white/5 text-gray-600' : 'bg-[#252840] text-gray-400'
                }`}>
                  {isCleared ? <CheckCircle size={18} /> : isLocked ? <Lock size={15} /> : idx + 1}
                </div>

                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${isCleared ? 'text-indigo-300' : isLocked ? 'text-gray-600' : 'text-white'}`}>
                    {topic.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{topic.description}</p>
                </div>

                {/* 도전 버튼 */}
                {!isLocked && (
                  <button
                    onClick={() => startTopic(topic.id, topic.title)}
                    disabled={!!loadingTopicId}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all ${
                      isCleared
                        ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50'
                    }`}>
                    {isLoading
                      ? <><Loader2 size={12} className="animate-spin" /> 생성 중</>
                      : <><Play size={12} /> {isCleared ? '다시 풀기' : '도전'}</>
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
