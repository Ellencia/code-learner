import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { chat } from '../api';
import { LANGUAGE_LABELS, LANGUAGE_ICONS } from '../types';
import ReactMarkdown from 'react-markdown';

const QUICK_PROMPTS = [
  '초보자가 꼭 알아야 할 개념 5가지',
  '실무에서 자주 쓰이는 패턴은?',
  '좋은 코드 작성 습관은?',
  '이 언어의 장단점은?',
  '흔히 하는 실수는?',
  '다음에 뭘 배우면 좋을까요?',
];

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-start gap-2.5 md:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-indigo-600' : 'bg-[#2a2f45]'
      }`}>
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>
      <div className={`max-w-[80%] md:max-w-[75%] rounded-2xl px-3.5 md:px-4 py-2.5 md:py-3 text-sm ${
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-[#1e2235] text-gray-200 rounded-tl-sm border border-white/5'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none
            prose-p:text-gray-200 prose-p:leading-relaxed prose-p:my-1
            prose-code:text-indigo-300 prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-black/40 prose-pre:rounded-lg prose-pre:my-2 prose-pre:overflow-x-auto
            prose-headings:text-white prose-headings:text-sm prose-headings:my-2
            prose-li:text-gray-200 prose-li:my-0.5
            prose-strong:text-white">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatView() {
  const { settings, messages, addMessage, clearMessages, updateStreak } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const lang = settings.selectedLanguage;

  const systemPrompt = `당신은 ${LANGUAGE_LABELS[lang]} 전문 코딩 튜터입니다.
학습자가 ${LANGUAGE_LABELS[lang]}를 잘 배울 수 있도록 친절하고 명확하게 도와주세요.
- 코드 예시는 반드시 코드 블록(\`\`\`)을 사용해주세요
- 복잡한 개념은 단계적으로 설명해주세요
- 격려하는 말투를 사용해주세요
- 한국어로 답변해주세요`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (!settings.apiKey) {
      alert('먼저 Settings에서 API 키를 설정해주세요.');
      return;
    }

    setInput('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    addMessage({ role: 'user', content: text });
    setIsLoading(true);

    try {
      const allMessages = [...messages, { role: 'user' as const, content: text }];
      const response = await chat({ settings, messages: allMessages, systemPrompt });
      addMessage({ role: 'assistant', content: response });
      updateStreak();
    } catch (e) {
      addMessage({ role: 'assistant', content: `오류가 발생했습니다: ${(e as Error).message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // On mobile (touch devices) Enter should not send — use button instead
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth >= 768) {
      e.preventDefault();
      send();
    }
  };

  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const t = e.target as HTMLTextAreaElement;
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-white/5 bg-[#1a1d2e]">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Bot size={16} />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">
              {LANGUAGE_ICONS[lang]} {LANGUAGE_LABELS[lang]} AI 튜터
            </h2>
            <p className="text-gray-500 text-xs">무엇이든 질문하세요</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 text-gray-500 active:text-red-400 text-xs transition-colors p-1.5"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">대화 초기화</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-5 py-4 space-y-3 md:space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-white text-lg font-semibold mb-2">AI 튜터와 대화하기</h3>
            <p className="text-gray-400 text-sm mb-5 max-w-xs">
              {LANGUAGE_LABELS[lang]}에 관한 무엇이든 물어보세요!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm md:max-w-md">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setInput(p); inputRef.current?.focus(); }}
                  className="text-left bg-[#1e2235] active:bg-[#252840] border border-white/5 rounded-xl px-3 py-2.5 text-gray-400 active:text-white text-xs transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#2a2f45] flex items-center justify-center flex-shrink-0">
                  <Bot size={13} />
                </div>
                <div className="bg-[#1e2235] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 md:px-4 py-3 border-t border-white/5 bg-[#1a1d2e]"
           style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-end gap-2.5 bg-[#1e2235] border border-white/10 focus-within:border-indigo-500/50 rounded-2xl px-3.5 py-2.5 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={autoResize}
            placeholder={`${LANGUAGE_LABELS[lang]}에 대해 질문하세요...`}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none overflow-y-auto leading-relaxed"
            // font-size 16px prevents iOS auto-zoom on focus
            style={{ fontSize: '16px', minHeight: '24px', maxHeight: '120px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 bg-indigo-600 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-all"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-gray-600 text-[10px] mt-1.5 hidden md:block">
          Enter: 전송 &nbsp;•&nbsp; Shift+Enter: 줄바꿈
        </p>
      </div>
    </div>
  );
}
