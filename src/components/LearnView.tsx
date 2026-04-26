import { useState } from 'react';
import { BookOpen, Send, Loader2, ChevronDown, Database, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { explainConcept } from '../api';
import { LANGUAGE_LABELS, LANGUAGE_ICONS } from '../types';
import ReactMarkdown from 'react-markdown';

const CACHE_PREFIX = 'learn_cache_';

function getCacheKey(lang: string, topic: string) {
  return `${CACHE_PREFIX}${lang}__${topic}`;
}

function loadCache(lang: string, topic: string): string | null {
  try {
    return localStorage.getItem(getCacheKey(lang, topic));
  } catch {
    return null;
  }
}

function saveCache(lang: string, topic: string, content: string) {
  try {
    localStorage.setItem(getCacheKey(lang, topic), content);
  } catch {
    // localStorage 용량 초과 등은 무시
  }
}

function deleteCache(lang: string, topic: string) {
  try {
    localStorage.removeItem(getCacheKey(lang, topic));
  } catch {
    // ignore
  }
}

const TOPICS: Record<string, string[]> = {
  python: ['변수와 자료형', '조건문', '반복문', '함수', '리스트/딕셔너리', '클래스', '예외처리', '파일 입출력', '모듈/패키지', '데코레이터', '제너레이터', 'lambda', '컴프리헨션'],
  java: ['변수와 자료형', '클래스와 객체', '상속', '인터페이스', '제네릭', '컬렉션', '스트림', '예외처리', '멀티스레딩', 'Optional', 'Lombok'],
  javascript: ['var/let/const', '화살표 함수', '프로미스', 'async/await', '구조분해할당', '스프레드 연산자', '클로저', '프로토타입', 'DOM 조작', 'fetch API'],
  react: ['JSX', 'useState', 'useEffect', 'useContext', 'useRef', 'useMemo', 'useCallback', 'Custom Hook', 'React Router', '상태관리', 'React Query'],
  typescript: ['타입 vs 인터페이스', '제네릭', '유니온 타입', '인터섹션 타입', 'Utility Types', '타입 가드', '데코레이터', 'Enum', 'never/unknown'],
  cpp: ['포인터', '참조자', '클래스', '생성자/소멸자', '상속', '다형성', '템플릿', 'STL', '스마트 포인터', '메모리 관리'],
};

export default function LearnView() {
  const { settings, updateStreak } = useStore();
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [showTopicSheet, setShowTopicSheet] = useState(false);

  const lang = settings.selectedLanguage;
  const topics = TOPICS[lang] ?? [];

  const learn = async (t: string, forceRefresh = false) => {
    if (!t.trim()) return;
    setTopic(t);
    setShowTopicSheet(false);

    // 캐시 확인
    if (!forceRefresh) {
      const cached = loadCache(lang, t);
      if (cached) {
        setExplanation(cached);
        setFromCache(true);
        updateStreak();
        return;
      }
    }

    if (!settings.apiKey) {
      alert('먼저 Settings에서 API 키를 설정해주세요.');
      return;
    }

    setIsLoading(true);
    setExplanation('');
    setFromCache(false);
    try {
      const result = await explainConcept(settings, lang, t);
      setExplanation(result);
      saveCache(lang, t, result);
      updateStreak();
    } catch (e) {
      setExplanation(`오류: ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const ExplanationContent = (
    <div className="h-full overflow-y-auto">
      {!topic && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-white text-xl font-semibold mb-2">개념 학습</h3>
          <p className="text-gray-400 text-sm max-w-xs">
            배우고 싶은 개념을 선택하거나 직접 입력하세요.
            AI가 쉽고 자세하게 설명해드립니다!
          </p>
        </div>
      ) : (
        <div className="p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center gap-3 text-indigo-400 p-4">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">"{topic}" 설명 생성 중...</span>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3 mb-5">
                <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-2.5">
                  <span>{LANGUAGE_ICONS[lang]}</span>
                  {topic}
                </h2>
                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                  {fromCache && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full whitespace-nowrap">
                      <Database size={11} />
                      저장됨
                    </span>
                  )}
                  <button
                    onClick={() => { deleteCache(lang, topic); learn(topic, true); }}
                    title="AI에게 다시 요청"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 active:bg-white/15 px-2 py-1 rounded-full transition-all whitespace-nowrap"
                  >
                    <RefreshCw size={11} />
                    재생성
                  </button>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-code:text-indigo-300 prose-code:bg-[#252840] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-[#1e2235] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:overflow-x-auto
                prose-strong:text-white
                prose-li:text-gray-300
                prose-a:text-indigo-400">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">

      {/* ── Mobile header with topic picker ── */}
      <div className="md:hidden flex items-center gap-2 px-3 py-2.5 border-b border-white/5 bg-[#1a1d2e]">
        <BookOpen size={15} className="text-indigo-400 flex-shrink-0" />
        <button
          onClick={() => setShowTopicSheet(true)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
        >
          <span className="text-white text-sm font-medium truncate">
            {topic || `${LANGUAGE_ICONS[lang]} 주제 선택`}
          </span>
          <ChevronDown size={15} className="text-gray-500 flex-shrink-0" />
        </button>

        {/* Inline custom topic input */}
        <div className="flex items-center gap-1.5 bg-[#1e2235] border border-white/10 rounded-lg px-2.5 py-1.5">
          <input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { learn(customTopic); setCustomTopic(''); } }}
            placeholder="직접 입력..."
            className="bg-transparent text-white placeholder-gray-500 text-xs focus:outline-none w-24"
            style={{ fontSize: '16px', transform: 'scale(0.75)', transformOrigin: 'left', width: '96px' }}
          />
          <button
            onClick={() => { learn(customTopic); setCustomTopic(''); }}
            disabled={!customTopic.trim()}
            className="text-indigo-400 disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
      </div>

      {/* ── Mobile topic sheet ── */}
      {showTopicSheet && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setShowTopicSheet(false)} />
          <div className="md:hidden fixed bottom-14 left-0 right-0 z-50 bg-[#1a1d2e] rounded-t-2xl max-h-[70vh] flex flex-col"
               style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {LANGUAGE_ICONS[lang]} {LANGUAGE_LABELS[lang]} 주요 개념
              </span>
              <button onClick={() => setShowTopicSheet(false)} className="text-gray-500 text-xs">닫기</button>
            </div>
            <div className="overflow-y-auto p-3 grid grid-cols-2 gap-2">
              {topics.map((t) => {
                const cached = !!loadCache(lang, t);
                return (
                  <button
                    key={t}
                    onClick={() => learn(t)}
                    className={`px-3 py-2.5 rounded-xl text-sm text-left transition-all flex items-center justify-between gap-1 ${
                      topic === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#1e2235] text-gray-400 active:bg-[#252840]'
                    }`}
                  >
                    <span>{t}</span>
                    {cached && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#1a1d2e] flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <BookOpen size={16} />
              <span className="font-semibold text-white text-sm">개념 학습</span>
            </div>
            <p className="text-gray-500 text-xs">
              {LANGUAGE_ICONS[lang]} {LANGUAGE_LABELS[lang]} 주요 개념
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {topics.map((t) => {
              const cached = !!loadCache(lang, t);
              return (
                <button
                  key={t}
                  onClick={() => learn(t)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between gap-2 ${
                    topic === t
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#1e2235]'
                  }`}
                >
                  <span>{t}</span>
                  {cached && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-white/5">
            <p className="text-gray-500 text-xs mb-2">직접 입력</p>
            <div className="flex gap-2">
              <input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { learn(customTopic); setCustomTopic(''); } }}
                placeholder="주제 입력..."
                className="flex-1 bg-[#252840] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => { learn(customTopic); setCustomTopic(''); }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop explanation */}
        <div className="flex-1 overflow-hidden">
          {ExplanationContent}
        </div>
      </div>

      {/* ── Mobile explanation area ── */}
      <div className="md:hidden flex-1 overflow-hidden">
        {ExplanationContent}
      </div>

    </div>
  );
}
