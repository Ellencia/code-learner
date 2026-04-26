import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RefreshCw, Lightbulb, CheckCircle, ChevronDown, ChevronUp, Loader2, Code2, FileText } from 'lucide-react';
import { useStore } from '../store';
import { generateChallenge, reviewCode } from '../api';
import { LANGUAGE_LABELS, LANGUAGE_ICONS, MONACO_LANGUAGE_MAP } from '../types';
import ReactMarkdown from 'react-markdown';

export default function ChallengeView() {
  const {
    settings, currentChallenge, setChallenge, code, setCode,
    completedChallenges, completeChallenge, addXP, updateStreak, isLoading, setLoading,
  } = useStore();

  const [review, setReview] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  // mobile: which tab is active
  const [mobileTab, setMobileTab] = useState<'problem' | 'editor'>('problem');

  const loadChallenge = async () => {
    if (!settings.apiKey) {
      alert('먼저 Settings에서 API 키를 설정해주세요.');
      return;
    }
    setLoading(true);
    setReview('');
    setShowHints(false);
    setHintIndex(0);
    try {
      const c = await generateChallenge(
        settings,
        settings.selectedLanguage,
        settings.difficulty,
        completedChallenges
      );
      setChallenge(c);
      updateStreak();
      setMobileTab('problem');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    if (!currentChallenge || !code.trim()) return;
    setIsReviewing(true);
    // Switch to problem tab on mobile so user sees the review
    setMobileTab('problem');
    try {
      const result = await reviewCode(settings, code, currentChallenge);
      setReview(result);
      if (result.includes('O') || result.toLowerCase().includes('정답') || result.includes('맞')) {
        completeChallenge(currentChallenge.id);
        addXP(settings.difficulty === 'beginner' ? 10 : settings.difficulty === 'intermediate' ? 25 : 50);
      }
    } catch (e) {
      setReview(`오류: ${(e as Error).message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const showNextHint = () => {
    if (!currentChallenge) return;
    setHintIndex(Math.min(hintIndex + 1, currentChallenge.hints.length - 1));
    setShowHints(true);
  };

  const lang = settings.selectedLanguage;
  const isCompleted = currentChallenge && completedChallenges.includes(currentChallenge.id);
  const diffLabel = settings.difficulty === 'beginner' ? '초급' : settings.difficulty === 'intermediate' ? '중급' : '고급';

  const ProblemPane = (
    <div className="h-full overflow-y-auto">
      {!currentChallenge ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-white text-xl font-semibold mb-2">준비되셨나요?</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            AI가 {LANGUAGE_LABELS[lang]} 문제를 생성해드립니다.
          </p>
          <button
            onClick={loadChallenge}
            disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : '✨'}
            {isLoading ? '생성 중...' : '챌린지 시작'}
          </button>
        </div>
      ) : (
        <div className="p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isCompleted && (
              <span className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 px-2.5 py-1 rounded-full">
                <CheckCircle size={12} /> 완료
              </span>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              settings.difficulty === 'beginner' ? 'bg-green-400/10 text-green-400' :
              settings.difficulty === 'intermediate' ? 'bg-yellow-400/10 text-yellow-400' :
              'bg-red-400/10 text-red-400'
            }`}>
              {diffLabel}
            </span>
          </div>

          <div className="bg-[#252840] rounded-xl p-4">
            <h3 className="text-white font-semibold text-base mb-2 leading-tight">
              {currentChallenge.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {currentChallenge.description}
            </p>
          </div>

          {/* Mobile: go-to-editor button */}
          <button
            onClick={() => setMobileTab('editor')}
            className="md:hidden w-full flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <Code2 size={15} />
            에디터로 이동
          </button>

          {/* Hints */}
          <div>
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 text-yellow-400 text-sm active:text-yellow-300 transition-colors"
            >
              <Lightbulb size={15} />
              힌트 보기
              {showHints ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showHints && (
              <div className="mt-2 space-y-2">
                {currentChallenge.hints.slice(0, hintIndex + 1).map((hint, i) => (
                  <div key={i} className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3 text-yellow-200 text-sm">
                    💡 힌트 {i + 1}: {hint}
                  </div>
                ))}
                {hintIndex < currentChallenge.hints.length - 1 && (
                  <button
                    onClick={showNextHint}
                    className="text-xs text-gray-500 active:text-gray-300 transition-colors"
                  >
                    다음 힌트 →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Review Result */}
          {(review || isReviewing) && (
            <div className="bg-[#1e2235] rounded-xl p-4 border border-white/5">
              <h4 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                🤖 AI 코드 리뷰
              </h4>
              {isReviewing ? (
                <div className="flex items-center gap-2 text-indigo-400 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  분석 중...
                </div>
              ) : (
                <div className="text-gray-300 text-sm prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{review}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const EditorPane = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE_MAP[lang]}
          value={code}
          onChange={(v) => setCode(v ?? '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true },
            wordWrap: 'on',
          }}
        />
      </div>
      <div className="p-3 border-t border-white/5 bg-[#1a1d2e] flex items-center justify-between gap-2">
        <p className="text-gray-500 text-xs hidden sm:block">
          {code.split('\n').length}줄 • {lang}
        </p>
        <button
          onClick={submitCode}
          disabled={!currentChallenge || isReviewing || !code.trim()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all ml-auto"
        >
          {isReviewing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {isReviewing ? '검토 중...' : '제출 & 리뷰'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-white/5 bg-[#1a1d2e] gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl md:text-2xl flex-shrink-0">{LANGUAGE_ICONS[lang]}</span>
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm md:text-base truncate">
              {currentChallenge ? currentChallenge.title : `${LANGUAGE_LABELS[lang]} 챌린지`}
            </h2>
            <p className="text-gray-500 text-xs">
              {diffLabel} • {completedChallenges.length}개 완료
            </p>
          </div>
        </div>
        <button
          onClick={loadChallenge}
          disabled={isLoading}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all flex-shrink-0"
        >
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          <span className="hidden sm:inline">{currentChallenge ? '새 문제' : '문제 생성'}</span>
          <span className="sm:hidden">{currentChallenge ? '새 문제' : '시작'}</span>
        </button>
      </div>

      {/* Desktop: side-by-side | Mobile: tabs */}
      <div className="flex-1 overflow-hidden">

        {/* Desktop layout */}
        <div className="hidden md:flex h-full">
          <div className="w-5/12 border-r border-white/5 overflow-hidden flex flex-col">
            {ProblemPane}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            {EditorPane}
          </div>
        </div>

        {/* Mobile layout: tab switcher */}
        <div className="md:hidden flex flex-col h-full">
          {/* Tab bar */}
          <div className="flex border-b border-white/5 bg-[#1a1d2e] flex-shrink-0">
            <button
              onClick={() => setMobileTab('problem')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all ${
                mobileTab === 'problem'
                  ? 'text-white border-b-2 border-indigo-500'
                  : 'text-gray-500'
              }`}
            >
              <FileText size={15} />
              문제
            </button>
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all ${
                mobileTab === 'editor'
                  ? 'text-white border-b-2 border-indigo-500'
                  : 'text-gray-500'
              }`}
            >
              <Code2 size={15} />
              에디터
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {mobileTab === 'problem' ? ProblemPane : EditorPane}
          </div>
        </div>

      </div>
    </div>
  );
}
