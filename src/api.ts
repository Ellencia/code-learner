import type { Message, Settings, Language, Difficulty, Challenge } from './types';

interface ChatOptions {
  settings: Settings;
  messages: Message[];
  systemPrompt?: string;
}

async function callGroq(apiKey: string, messages: Array<{role: string; content: string}>, model = 'llama-3.3-70b-versatile') {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 2048 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Groq API error ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0].message.content as string;
}

async function callOpenAI(apiKey: string, messages: Array<{role: string; content: string}>) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.7, max_tokens: 2048 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `OpenAI API error ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0].message.content as string;
}

async function callGemini(apiKey: string, messages: Array<{role: string; content: string}>) {
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMsgs = messages.filter(m => m.role !== 'system');

  const contents = chatMsgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = { contents };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gemini API error ${res.status}`);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text as string;
}

export async function chat({ settings, messages, systemPrompt }: ChatOptions): Promise<string> {
  const { apiKey, apiProvider } = settings;
  if (!apiKey) throw new Error('API 키를 먼저 설정해주세요.');

  const allMsgs = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages.map(m => ({ role: m.role, content: m.content }))]
    : messages.map(m => ({ role: m.role, content: m.content }));

  switch (apiProvider) {
    case 'groq': return callGroq(apiKey, allMsgs);
    case 'openai': return callOpenAI(apiKey, allMsgs);
    case 'gemini': return callGemini(apiKey, allMsgs);
    default: throw new Error('알 수 없는 API 제공자입니다.');
  }
}

export async function generateChallenge(
  settings: Settings,
  language: Language,
  difficulty: Difficulty,
  completedIds: string[]
): Promise<Challenge> {
  const diffLabel = { beginner: '초급', intermediate: '중급', advanced: '고급' }[difficulty];
  const skipNote = completedIds.length > 0
    ? `이미 완료한 문제 ID: ${completedIds.slice(-5).join(', ')} (다른 문제를 내주세요)`
    : '';

  const prompt = `당신은 코딩 교육 전문가입니다. ${language} ${diffLabel} 수준의 코딩 챌린지를 하나 생성해주세요.
${skipNote}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "id": "고유한_영문_소문자_id",
  "language": "${language}",
  "difficulty": "${difficulty}",
  "title": "챌린지 제목",
  "description": "상세한 문제 설명 (입력/출력 예시 포함)",
  "starterCode": "// 시작 코드 (주석과 함께)",
  "hints": ["힌트1", "힌트2", "힌트3"]
}`;

  const response = await chat({
    settings,
    messages: [{ role: 'user', content: prompt }],
  });

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI 응답 파싱 실패');
  return JSON.parse(jsonMatch[0]) as Challenge;
}

export async function reviewCode(
  settings: Settings,
  code: string,
  challenge: Challenge
): Promise<string> {
  const prompt = `다음 ${challenge.language} 코드를 리뷰해주세요.

문제: ${challenge.title}
설명: ${challenge.description}

제출 코드:
\`\`\`${challenge.language}
${code}
\`\`\`

다음을 분석해주세요:
1. 정답 여부 (O/X)
2. 코드의 장점
3. 개선할 부분
4. 더 나은 풀이 방법 (있다면)
5. 총평

한국어로 친근하게 설명해주세요.`;

  return chat({
    settings,
    messages: [{ role: 'user', content: prompt }],
  });
}

export async function explainConcept(
  settings: Settings,
  language: Language,
  topic: string
): Promise<string> {
  const prompt = `${language}의 "${topic}" 개념을 초보자도 이해하기 쉽게 설명해주세요.

- 핵심 개념 설명
- 실제 코드 예시 (코드 블록 사용)
- 언제 사용하면 좋은지
- 주의사항

한국어로 설명해주세요.`;

  return chat({
    settings,
    messages: [{ role: 'user', content: prompt }],
  });
}
