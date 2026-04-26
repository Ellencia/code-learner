import { useState } from 'react';
import { Trash2, RotateCcw, ChevronDown, ChevronUp, BookMarked } from 'lucide-react';
import { useStore } from '../store';
import { LANGUAGE_ICONS, LANGUAGE_LABELS } from '../types';
import type { WrongNote } from '../types';
import ReactMarkdown from 'react-markdown';

function NoteCard({ note, onDelete, onRetry }: {
  note: WrongNote;
  onDelete: () => void;
  onRetry: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#1e2235] border border-white/5 rounded-xl overflow-hidden">
      {/* 카드 헤더 */}
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
              'bg-red-400/10 text-red-400'
            }`}>
              {note.challenge.difficulty === 'beginner' ? '초급' : note.challenge.difficulty === 'intermediate' ? '중급' : '고급'}
            </span>
            <span className="text-gray-600 text-xs">{note.date}</span>
          </div>
        </button>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onRetry}
            title="다시 풀기"
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 bg-indigo-400/10 hover:bg-indigo-400/20 px-2 py-1.5 rounded-lg text-xs transition-all"
          >
            <RotateCcw size={12} /> 다시 풀기
          </button>
          <button
            onClick={onDelete}
            className="text-gray-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 펼쳐보기 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-gray-400 border-t border-white/5 transition-colors"
      >
        {expanded ? <><ChevronUp size={12} /> 접기</> : <><ChevronDown size={12} /> 상세 보기</>}
      </button>

      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-4">
          {/* 문제 설명 */}
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">문제</p>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-[#252840] rounded-lg p-3">
              {note.challenge.description}
            </p>
          </div>

          {/* 제출한 코드 */}
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">내가 제출한 코드</p>
            <pre className="bg-[#0d0f1a] rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
              {note.submittedCode}
            </pre>
          </div>

          {/* AI 리뷰 */}
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">AI 리뷰</p>
            <div className="bg-[#252840] rounded-lg p-3 text-sm prose prose-invert prose-sm max-w-none
              prose-p:text-gray-300 prose-code:text-indigo-300 prose-code:bg-black/30 prose-code:px-1 prose-code:rounded
              prose-pre:bg-black/40 prose-pre:rounded-lg prose-strong:text-white prose-li:text-gray-300">
              <ReactMarkdown>{note.review}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WrongNoteView() {
  const { wrongNotes, deleteWrongNote, setChallenge, setMode } = useStore();
  const [filterLang, setFilterLang] = useState<string>('all');

  const langs = [...new Set(wrongNotes.map(n => n.challenge.language))];
  const filtered = filterLang === 'all' ? wrongNotes : wrongNotes.filter(n => n.challenge.language === filterLang);

  const handleRetry = (note: WrongNote) => {
    setChallenge(note.challenge);
    setMode('challenge');
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1a1d2e]">
        <div className="flex items-center gap-2">
          <BookMarked size={16} className="text-red-400" />
          <h2 className="text-white font-semibold text-sm">오답 노트</h2>
          {wrongNotes.length > 0 && (
            <span className="bg-red-400/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
              {wrongNotes.length}
            </span>
          )}
        </div>
        {/* 언어 필터 */}
        {langs.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterLang('all')}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                filterLang === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white bg-white/5'
              }`}
            >
              전체
            </button>
            {langs.map(l => (
              <button
                key={l}
                onClick={() => setFilterLang(l)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                  filterLang === l ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white bg-white/5'
                }`}
              >
                {LANGUAGE_ICONS[l as keyof typeof LANGUAGE_ICONS]} {LANGUAGE_LABELS[l as keyof typeof LANGUAGE_LABELS]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-white text-lg font-semibold mb-2">오답 노트가 비어있어요</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              챌린지에서 틀린 문제가 생기면 여기에 자동으로 저장됩니다.
              다시 풀어보고 실력을 키워보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {filtered.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => deleteWrongNote(note.id)}
                onRetry={() => handleRetry(note)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
