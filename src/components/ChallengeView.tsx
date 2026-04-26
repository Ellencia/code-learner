import { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, RefreshCw, Lightbulb, CheckCircle,
  ChevronDown, ChevronUp, Loader2, Code2, FileText,
  Terminal, XCircle, History, Bookmark, TrendingUp, TrendingDown, X,
} from 'lucide-react';
import { useStore } from '../store';
import { generateChallenge, reviewCode, runCode } from '../api';
import { LANGUAGE_LABELS, LANGUAGE_ICONS, MONACO_LANGUAGE_MAP } from '../types';
import type { WrongNote, Snippet } from '../types';
import ReactMarkdown from 'react-markdown';

function isCorrect(review: string) {
  // 오답 신호를 먼저 확인 (정답 여부 줄에 X가 있거나, 명시적 오답 표현)
  const wrongPattern = /정답\s*여부[^\n]{0,40}[Xx✗❌×❎]|오답입니다|틀렸습니다|틀린\s*코드/;
  if (wrongPattern.test(review)) return false;

  // 정답 신호 확인
  const correctPattern = /정답\s*여부[^\n]{0,40}[Oo✓✅○⭕]|정답입니다|맞았습니다|올바른\s*풀이/;
  if (correctPattern.test(review)) return true;

  // 판별 불가 시 오답으로 처리 (놓치는 것보다 저장하는 게 안전)
  return false;
}

// 최근 결과 기반 난이도 제안
function useDifficultySuggestion(recentResults: boolean[], currentDifficulty: string) {
  return useMemo(() => {
    if (recentResults.length < 5) return null;
    const last5 = recentResults.slice(-5);
    const correctCount = last5.filter(Boolean).length;
    if (correctCount >= 4 && currentDifficulty !== 'advanced') {
      return { direction: 'up' as const, msg: '최근 5문제 중 4개 이상 정답! 난이도를 올려볼까요? 🚀' };
    }
    if (correctCount <= 1 && currentDifficulty !== 'beginner') {
      return { direction: 'down' as const, msg: '조금 어렵게 느껴지시나요? 난이도를 낮춰볼까요? 💪' };
    }
    return null;
  }, [recentResults, currentDifficulty]);
}

export default function ChallengeView() {
  const {
    settings, currentChallenge, setChallenge, code, setCode,
    completedChallenges, completeChallenge, addXP, updateStreak,
    isLoading, setLoading, saveChallenge, addWrongNote, savedChallenges,
    addSnippet, recentResults, recordResult, logStudy, setSettings,
  } = useStore();

  const [review, setReview] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [mobileTab, setMobileTab] = useState<'problem' | 'editor'>('problem');
  const [runOutput, setRunOutput] = useState<{ stdout: string; stderr: string; exitCode: number } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);

  const lang = settings.selectedLanguage;
  const diffLabel = settings.difficulty === 'beginner' ? '초급' : settings.difficulty === 'intermediate' ? '중급' : '고급';
  const isCompleted = currentChallenge && completedChallenges.includes(currentChallenge.id);
  const cachedForLang = savedChallenges.filter(c => c.language === lang);
  const suggestion = useDifficultySuggestion(recentResults, settings.difficulty);

  const loadChallenge = async () => {
    if (!settings.apiKey) { alert('먼저 Settings에서 API 키를 설정해주세요.'); return; }
    setLoading(true);
    setReview('');
    setRunOutput(null);
    setShowHints(false);
    setHintIndex(0);
    setShowHistory(false);
    setDismissedSuggestion(false);
    try {
      const c = await generateChallenge(settings, lang, settings.difficulty, completedChallenges);
      setChallenge(c);
      saveChallenge(c);
      updateStreak();
      logStudy();
      setMobileTab('problem');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadFromCache = (c: typeof savedChallenges[0]) => {
    setChallenge(c);
    setReview('');
    setRunOutput(null);
    setShowHints(false);
    setHintIndex(0);
    setShowHistory(false);
    setMobileTab('problem');
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setRunOutput(null);
    try {
      const result = await runCode(lang, code);
      setRunOutput(result);
      logStudy();
    } catch (e) {
      setRunOutput({ stdout: '', stderr: (e as Error).message, exitCode: 1 });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentChallenge || !code.trim()) return;
    setIsReviewing(true);
    setMobileTab('problem');
    try {
      const result = await reviewCode(settings, code, currentChallenge);
      setReview(result);
      const correct = isCorrect(result);
      recordResult(correct);
      logStudy();
      if (correct) {
        completeChallenge(currentChallenge.id);
        addXP(settings.difficulty === 'beginner' ? 10 : settings.difficulty === 'intermediate' ? 25 : 50);
      } else {
        const note: WrongNote = {
          id: `${currentChallenge.id}_${Date.now()}`,
          challenge: currentChallenge,
          submittedCode: code,
          review: result,
          date: new Date().toLocaleDateString('ko-KR'),
        };
        addWrongNote(note);
      }
    } catch (e) {
      setReview(`오류: ${(e as Error).message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSaveSnippet = () => {
    if (!code.trim()) return;
    const title = prompt('스니펫 이름을 입력하세요:', currentChallenge?.title ?? '');
    if (!title) return;
    const snippet: Snippet = {
      id: `snippet_${Date.now()}`,
      title,
      code,
      language: lang,
      date: new Date().toLocaleDateString('ko-KR'),
    };
    addSnippet(snippet);
  };

  const applyDifficulty = (direction: 'up' | 'down') => {
    const order = ['beginner', 'intermediate', 'advanced'] as const;
    const idx = order.indexOf(settings.difficulty);
    const next = direction === 'up' ? order[Math.min(idx + 1, 2)] : order[Math.max(idx - 1, 0)];
    setSettings({ difficulty: next });
    setDismissedSuggestion(true);
  };

  const showNextHint = () => {
    if (!currentChallenge) return;
    setHintIndex(Math.min(hintIndex + 1, currentChallenge.hints.length - 1));
    setShowHints(true);
  };

  // ── 문제 패널 ──────────────────────────────────────
  const ProblemPane = (
    <div className="h-full overflow-y-auto">
      {!currentChallenge ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
          <div className="text-6xl">🚀</div>
          <div>
            <h3 className="text-white text-xl font-semibold mb-2">준비되셨나요?</h3>
            <p className="text-gray-400 text-sm max-w-xs">AI가 {LANGUAGE_LABELS[lang]} 문제를 생성해드립니다.</p>
          </div>
          <button onClick={loadChallenge} disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : '✨'}
            {isLoading ? '생성 중...' : '챌린지 시작'}
          </button>
          {cachedForLang.length > 0 && (
            <button onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors">
              <History size={14} /> 이전 문제 불러오기 ({cachedForLang.length})
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 md:p-5 space-y-4">
          {/* 난이도 자동조정 배너 */}
          {suggestion && !dismissedSuggestion && (
            <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
              suggestion.direction === 'up'
                ? 'bg-green-400/5 border-green-400/20 text-green-300'
                : 'bg-yellow-400/5 border-yellow-400/20 text-yellow-300'
            }`}>
              {suggestion.direction === 'up' ? <TrendingUp size={15} className="flex-shrink-0 mt-0.5" /> : <TrendingDown size={15} className="flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="mb-2">{suggestion.msg}</p>
                <div className="flex gap-2">
                  <button onClick={() => applyDifficulty(suggestion.direction)}
                    className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium">
                    적용하기
                  </button>
                  <button onClick={() => setDismissedSuggestion(true)}
                    className="text-xs px-3 py-1 hover:bg-white/10 rounded-lg transition-colors opacity-60">
                    괜찮아요
                  </button>
                </div>
              </div>
              <button onClick={() => setDismissedSuggestion(true)} className="opacity-40 hover:opacity-70 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {isCompleted && (
              <span className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 px-2.5 py-1 rounded-full">
                <CheckCircle size={12} /> 완료
              </span>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              settings.difficulty === 'beginner' ? 'bg-green-400/10 text-green-400' :
              settings.difficulty === 'intermediate' ? 'bg-yellow-400/10 text-yellow-400' :
              'bg-red-400/10 text-red-400'}`}>
              {diffLabel}
            </span>
          </div>

          <div className="bg-[#252840] rounded-xl p-4">
            <h3 className="text-white font-semibold text-base mb-2 leading-tight">{currentChallenge.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{currentChallenge.description}</p>
          </div>

          <button onClick={() => setMobileTab('editor')}
            className="md:hidden w-full flex items-center justify-center gap-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 py-2.5 rounded-xl text-sm font-medium">
            <Code2 size={15} /> 에디터로 이동
          </button>

          {/* 힌트 */}
          <div>
            <button onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 text-yellow-400 text-sm transition-colors">
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
                  <button onClick={showNextHint} className="text-xs text-gray-500 hover:text-gray-300">다음 힌트 →</button>
                )}
              </div>
            )}
          </div>

          {/* AI 리뷰 */}
          {(review || isReviewing) && (
            <div className="bg-[#1e2235] rounded-xl p-4 border border-white/5">
              <h4 className="text-white font-medium text-sm mb-3">🤖 AI 코드 리뷰</h4>
              {isReviewing ? (
                <div className="flex items-center gap-2 text-indigo-400 text-sm">
                  <Loader2 size={14} className="animate-spin" /> 분석 중...
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

  // ── 에디터 패널 ──────────────────────────────────────
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

      {/* 터미널 출력 */}
      {(runOutput || isRunning) && (
        <div className="border-t border-white/5 bg-[#0d0f1a] flex flex-col" style={{ maxHeight: '35%', minHeight: '80px' }}>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-green-400" />
              <span className="text-xs text-gray-400">출력</span>
              {runOutput && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${runOutput.exitCode === 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  exit {runOutput.exitCode}
                </span>
              )}
            </div>
            <button onClick={() => setRunOutput(null)} className="text-gray-600 hover:text-gray-400"><XCircle size={13} /></button>
          </div>
          <div className="overflow-y-auto p-3 font-mono text-xs leading-relaxed flex-1">
            {isRunning ? (
              <span className="text-gray-500 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> 실행 중...</span>
            ) : (
              <>
                {runOutput?.stdout && <pre className="text-green-300 whitespace-pre-wrap">{runOutput.stdout}</pre>}
                {runOutput?.stderr && <pre className="text-red-400 whitespace-pre-wrap">{runOutput.stderr}</pre>}
                {!runOutput?.stdout && !runOutput?.stderr && <span className="text-gray-600">(출력 없음)</span>}
              </>
            )}
          </div>
        </div>
      )}

      {/* 하단 버튼 바 */}
      <div className="p-2.5 border-t border-white/5 bg-[#1a1d2e] flex items-center gap-2">
        <p className="text-gray-600 text-xs hidden sm:block">{code.split('\n').length}줄 • {lang}</p>
        <div className="flex items-center gap-2 ml-auto">
          {/* 스니펫 저장 */}
          <button onClick={handleSaveSnippet} disabled={!code.trim()}
            title="코드 스니펫 저장"
            className="flex items-center gap-1 text-gray-500 hover:text-yellow-400 bg-white/5 hover:bg-yellow-400/10 disabled:opacity-30 p-1.5 rounded-lg text-xs transition-all border border-white/5">
            <Bookmark size={13} />
          </button>
          {/* 실행 */}
          <button onClick={handleRun} disabled={isRunning || !code.trim()}
            title={lang === 'react' ? 'React: DOM 없이 JS로 실행됩니다' : '코드 실행'}
            className="flex items-center gap-1.5 bg-[#2a2f45] hover:bg-[#32384f] active:bg-[#3a4060] disabled:opacity-40 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-white/5">
            {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Terminal size={13} />}
            실행
          </button>
          {/* 제출 */}
          <button onClick={handleSubmit} disabled={!currentChallenge || isReviewing || !code.trim()}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all">
            {isReviewing ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            {isReviewing ? '검토 중...' : '제출 & 리뷰'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-white/5 bg-[#1a1d2e] gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{LANGUAGE_ICONS[lang]}</span>
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm md:text-base truncate">
              {currentChallenge ? currentChallenge.title : `${LANGUAGE_LABELS[lang]} 챌린지`}
            </h2>
            <p className="text-gray-500 text-xs">{completedChallenges.length}개 완료</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {([
            { id: 'beginner', label: '초급', emoji: '🌱' },
            { id: 'intermediate', label: '중급', emoji: '🔥' },
            { id: 'advanced', label: '고급', emoji: '⚡' },
          ] as const).map(({ id, label, emoji }) => (
            <button key={id} onClick={() => setSettings({ difficulty: id })}
              className={`text-xs px-2 py-1 rounded-lg transition-all ${
                settings.difficulty === id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#252840] text-gray-400 hover:text-white'
              }`}>
              <span className="hidden sm:inline">{emoji} </span>{label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {cachedForLang.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg text-xs transition-all">
              <History size={13} />
              <span className="hidden sm:inline">이전 문제</span>
              <span className="bg-indigo-500/30 text-indigo-300 rounded px-1 text-[10px]">{cachedForLang.length}</span>
            </button>
          )}
          <button onClick={loadChallenge} disabled={isLoading}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all">
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            <span className="hidden sm:inline">{currentChallenge ? '새 문제' : '문제 생성'}</span>
            <span className="sm:hidden">{currentChallenge ? '새' : '시작'}</span>
          </button>
        </div>
      </div>

      {/* 이전 문제 히스토리 */}
      {showHistory && (
        <div className="border-b border-white/5 bg-[#1a1d2e] p-3">
          <p className="text-gray-500 text-xs mb-2">{LANGUAGE_ICONS[lang]} 저장된 {LANGUAGE_LABELS[lang]} 문제 ({cachedForLang.length})</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {cachedForLang.map(c => (
              <button key={c.id} onClick={() => loadFromCache(c)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  currentChallenge?.id === c.id
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-[#1e2235] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}>
                {completedChallenges.includes(c.id) ? '✅ ' : ''}{c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 본문 */}
      <div className="flex-1 overflow-hidden">
        <div className="hidden md:flex h-full">
          <div className="w-5/12 border-r border-white/5 overflow-hidden flex flex-col">{ProblemPane}</div>
          <div className="flex-1 flex flex-col overflow-hidden">{EditorPane}</div>
        </div>
        <div className="md:hidden flex flex-col h-full">
          <div className="flex border-b border-white/5 bg-[#1a1d2e] flex-shrink-0">
            <button onClick={() => setMobileTab('problem')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all ${mobileTab === 'problem' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500'}`}>
              <FileText size={15} /> 문제
            </button>
            <button onClick={() => setMobileTab('editor')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all ${mobileTab === 'editor' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500'}`}>
              <Code2 size={15} /> 에디터
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {mobileTab === 'problem' ? ProblemPane : EditorPane}
          </div>
        </div>
      </div>
    </div>
  );
}
