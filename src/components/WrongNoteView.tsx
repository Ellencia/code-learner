import { useState } from 'react';
import { Trash2, RotateCcw, ChevronDown, ChevronUp, BookMarked, Bookmark, Copy, Check, Lightbulb, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { LANGUAGE_ICONS, LANGUAGE_LABELS } from '../types';
import type { WrongNote, Snippet } from '../types';
import ReactMarkdown from 'react-markdown';
import { getWrongNoteHint } from '../api';

// ── 오답 카드 ─────────────────────────────────────────
function NoteCard({ note, onDelete, onRetry }: { note: WrongNote; onDelete: () => void; onRetry: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [hint, setHint] = useState('');
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const { settings } = useStore();

  const fetchHint = async () => {
    if (hint) { setExpanded(true); return; }
    setIsLoadingHint(true);
    setExpanded(true);
    try {
      const h = await getWrongNoteHint(settings, note);
      setHint(h);
    } catch (e) {
      setHint(`오류: ${(e as Error).message}`);
    } finally {
      setIsLoadingHint(false);
    }
  };

  return (
    <div className="bg-[#1e2235] border border-white/5 rounded-xl overflow-hidden">
      <div className="flex items-start justify-between p-4 gap-3">
        <button className="flex-1 text-left min-w-0" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2 mb-1">
            <span>{LANGUAGE_ICONS[note.challenge.language]}</span>
            <span className="text-white font-medium text-sm truncate">{note.challenge.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              note.challenge.difficulty === 'beginner' ? 'bg-green-400/10 text-green-400' :
              note.challenge.difficulty === 'intermediate' ? 'bg-yellow-400/10 text-yellow-400' :
              'bg-red-400/10 text-red-400'}`}>
              {note.challenge.difficulty === 'beginner' ? '초급' : note.challenge.difficulty === 'intermediate' ? '중급' : '고급'}
            </span>
            <span className="text-gray-600 text-xs">{note.date}</span>
          </div>
        </button>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={fetchHint} disabled={isLoadingHint}
            className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 px-2 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50">
            {isLoadingHint ? <Loader2 size={12} className="animate-spin" /> : <Lightbulb size={12} />}
            힌트
          </button>
          <button onClick={onRetry}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 bg-indigo-400/10 hover:bg-indigo-400/20 px-2 py-1.5 rounded-lg text-xs transition-all">
            <RotateCcw size={12} /> 다시 풀기
          </button>
          <button onClick={onDelete} className="text-gray-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-gray-400 border-t border-white/5 transition-colors">
        {expanded ? <><ChevronUp size={12} /> 접기</> : <><ChevronDown size={12} /> 상세 보기</>}
      </button>
      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-4">
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">문제</p>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-[#252840] rounded-lg p-3">{note.challenge.description}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">내가 제출한 코드</p>
            <pre className="bg-[#0d0f1a] rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">{note.submittedCode}</pre>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">AI 리뷰</p>
            <div className="bg-[#252840] rounded-lg p-3 text-sm prose prose-invert prose-sm max-w-none
              prose-p:text-gray-300 prose-code:text-indigo-300 prose-code:bg-black/30 prose-code:px-1 prose-code:rounded
              prose-pre:bg-black/40 prose-pre:rounded-lg prose-strong:text-white prose-li:text-gray-300">
              <ReactMarkdown>{note.review}</ReactMarkdown>
            </div>
          </div>
          {(hint || isLoadingHint) && (
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3">
              <p className="text-yellow-400 text-xs font-medium mb-2 flex items-center gap-1">
                <Lightbulb size={11} /> 맞춤 힌트
              </p>
              {isLoadingHint ? (
                <div className="flex items-center gap-2 text-yellow-400 text-xs">
                  <Loader2 size={11} className="animate-spin" /> 힌트 생성 중...
                </div>
              ) : (
                <div className="text-yellow-200 text-sm prose prose-invert prose-sm max-w-none prose-p:text-yellow-200">
                  <ReactMarkdown>{hint}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 스니펫 카드 ─────────────────────────────────────────
function SnippetCard({ snippet, onDelete }: { snippet: Snippet; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-[#1e2235] border border-white/5 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-3.5 gap-3">
        <button className="flex-1 text-left min-w-0" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2">
            <span>{LANGUAGE_ICONS[snippet.language]}</span>
            <span className="text-white font-medium text-sm truncate">{snippet.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-500 text-xs">{LANGUAGE_LABELS[snippet.language]}</span>
            <span className="text-gray-600 text-xs">• {snippet.date}</span>
            <span className="text-gray-600 text-xs">• {snippet.code.split('\n').length}줄</span>
          </div>
        </button>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={copy}
            className="flex items-center gap-1 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg text-xs transition-all">
            {copied ? <><Check size={12} className="text-green-400" /> 복사됨</> : <><Copy size={12} /> 복사</>}
          </button>
          <button onClick={onDelete} className="text-gray-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/5 p-3">
          <pre className="bg-[#0d0f1a] rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">{snippet.code}</pre>
        </div>
      )}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-1 text-xs text-gray-600 hover:text-gray-400 border-t border-white/5 transition-colors">
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
    </div>
  );
}

// ── 메인 뷰 ─────────────────────────────────────────────
export default function WrongNoteView() {
  const { wrongNotes, deleteWrongNote, snippets, deleteSnippet, setChallenge, setMode } = useStore();
  const [tab, setTab] = useState<'notes' | 'snippets'>('notes');
  const [filterLang, setFilterLang] = useState('all');

  const noteLangs = [...new Set(wrongNotes.map(n => n.challenge.language))];
  const snippetLangs = [...new Set(snippets.map(s => s.language))];
  const activeLangs = tab === 'notes' ? noteLangs : snippetLangs;

  const filteredNotes = filterLang === 'all' ? wrongNotes : wrongNotes.filter(n => n.challenge.language === filterLang);
  const filteredSnippets = filterLang === 'all' ? snippets : snippets.filter(s => s.language === filterLang);

  const handleRetry = (note: WrongNote) => { setChallenge(note.challenge); setMode('challenge'); };

  return (
    <div className="flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="border-b border-white/5 bg-[#1a1d2e]">
        <div className="flex">
          <button onClick={() => { setTab('notes'); setFilterLang('all'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
              tab === 'notes' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
            <BookMarked size={15} /> 오답 노트
            {wrongNotes.length > 0 && (
              <span className="bg-red-400/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full">{wrongNotes.length}</span>
            )}
          </button>
          <button onClick={() => { setTab('snippets'); setFilterLang('all'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
              tab === 'snippets' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}>
            <Bookmark size={15} /> 스니펫
            {snippets.length > 0 && (
              <span className="bg-yellow-400/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded-full">{snippets.length}</span>
            )}
          </button>
        </div>

        {/* 언어 필터 */}
        {activeLangs.length > 1 && (
          <div className="flex items-center gap-1.5 px-4 pb-2.5 flex-wrap">
            <button onClick={() => setFilterLang('all')}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all ${filterLang === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white bg-white/5'}`}>
              전체
            </button>
            {activeLangs.map(l => (
              <button key={l} onClick={() => setFilterLang(l)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${filterLang === l ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white bg-white/5'}`}>
                {LANGUAGE_ICONS[l as keyof typeof LANGUAGE_ICONS]} {LANGUAGE_LABELS[l as keyof typeof LANGUAGE_LABELS]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 내용 */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'notes' ? (
          filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-white text-lg font-semibold mb-2">오답 노트가 비어있어요</h3>
              <p className="text-gray-400 text-sm max-w-xs">챌린지에서 틀린 문제가 생기면 자동으로 저장됩니다.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              {filteredNotes.map(note => (
                <NoteCard key={note.id} note={note} onDelete={() => deleteWrongNote(note.id)} onRetry={() => handleRetry(note)} />
              ))}
            </div>
          )
        ) : (
          filteredSnippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4">💾</div>
              <h3 className="text-white text-lg font-semibold mb-2">저장된 스니펫이 없어요</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                에디터 하단의 <Bookmark size={13} className="inline mx-1" /> 버튼으로 코드를 저장하세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              {filteredSnippets.map(s => (
                <SnippetCard key={s.id} snippet={s} onDelete={() => deleteSnippet(s.id)} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
