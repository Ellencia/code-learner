import { useState } from 'react';
import { Settings, Key, Eye, EyeOff, X } from 'lucide-react';
import { useStore } from '../store';

interface Props {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: Props) {
  const { settings, setSettings } = useStore();
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(settings.apiKey);

  const save = () => {
    setSettings({ apiKey: localKey });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#1e2235] rounded-t-2xl md:rounded-2xl p-6 w-full md:max-w-md shadow-2xl border border-white/10"
           style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Settings size={20} />
            <h2 className="text-lg font-semibold text-white">API 설정</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 active:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">AI 제공자</label>
            <div className="grid grid-cols-3 gap-2">
              {(['groq', 'openai', 'gemini'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSettings({ apiProvider: p })}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                    settings.apiProvider === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#2a2f45] text-gray-400 active:text-white active:bg-[#32384f]'
                  }`}
                >
                  {p === 'groq' ? 'Groq' : p === 'openai' ? 'OpenAI' : 'Gemini'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {settings.apiProvider === 'groq' && 'Groq: 빠른 무료 API (llama-3.3-70b)'}
              {settings.apiProvider === 'openai' && 'OpenAI: GPT-4o-mini 사용'}
              {settings.apiProvider === 'gemini' && 'Google: Gemini 2.0 Flash 사용'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Key size={14} /> API 키
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                placeholder="API 키를 입력하세요"
                autoComplete="off"
                autoCapitalize="off"
                className="w-full bg-[#2a2f45] border border-white/10 rounded-lg px-4 py-3 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 active:text-white p-1"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              키는 브라우저 로컬스토리지에만 저장됩니다.
            </p>
          </div>
        </div>

        <button
          onClick={save}
          className="w-full mt-6 bg-indigo-600 active:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors text-sm"
        >
          저장
        </button>
      </div>
    </div>
  );
}
