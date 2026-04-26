import { useMemo } from 'react';
import { Flame, Star, Trophy, Target, TrendingUp, Calendar } from 'lucide-react';
import { useStore } from '../store';
import { LANGUAGE_ICONS, LANGUAGE_LABELS } from '../types';

// 히트맵 셀 색상 (0~4단계)
function heatColor(count: number) {
  if (count === 0) return 'bg-[#1e2235]';
  if (count <= 2) return 'bg-emerald-900';
  if (count <= 4) return 'bg-emerald-700';
  if (count <= 7) return 'bg-emerald-500';
  return 'bg-emerald-400';
}

function buildCalendar(studyLog: Record<string, number>, weeks: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 오늘 기준으로 weeks*7일 전 시작, 일요일부터 맞춤
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - (weeks * 7 - 1));
  // 첫 주 일요일로 맞추기
  startDay.setDate(startDay.getDate() - startDay.getDay());

  const cols: { date: string; count: number; isToday: boolean; isFuture: boolean }[][] = [];
  const cur = new Date(startDay);

  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cur.toISOString().slice(0, 10);
      col.push({
        date: dateStr,
        count: studyLog[dateStr] ?? 0,
        isToday: cur.toDateString() === today.toDateString(),
        isFuture: cur > today,
      });
      cur.setDate(cur.getDate() + 1);
    }
    cols.push(col);
  }
  return cols;
}

function Heatmap({ weeks }: { weeks: number }) {
  const { studyLog } = useStore();
  const calendar = useMemo(() => buildCalendar(studyLog, weeks), [studyLog, weeks]);

  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

  // 월 레이블: 각 주의 첫날이 새 달이면 표시
  const monthLabels = calendar.map((col, i) => {
    const firstDay = col[0].date;
    const prevFirstDay = i > 0 ? calendar[i - 1][0].date : null;
    const month = new Date(firstDay).getMonth();
    const prevMonth = prevFirstDay ? new Date(prevFirstDay).getMonth() : -1;
    return month !== prevMonth ? new Date(firstDay).toLocaleDateString('ko-KR', { month: 'short' }) : '';
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1 min-w-0">
        {/* 요일 레이블 */}
        <div className="flex flex-col gap-1 mr-1">
          <div className="h-4" />
          {DAYS.map(d => (
            <div key={d} className="w-3 h-3 flex items-center justify-center text-[9px] text-gray-600">{d}</div>
          ))}
        </div>
        {/* 주 컬럼들 */}
        {calendar.map((col, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            <div className="h-4 flex items-end justify-center">
              <span className="text-[9px] text-gray-600 whitespace-nowrap">{monthLabels[wi]}</span>
            </div>
            {col.map(({ date, count, isToday, isFuture }) => (
              <div
                key={date}
                title={`${date}: ${count}회`}
                className={`w-3 h-3 rounded-sm transition-colors ${
                  isFuture ? 'bg-[#16192a]' :
                  isToday ? 'ring-1 ring-indigo-400 ' + heatColor(count) :
                  heatColor(count)
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-gray-600 text-xs">적음</span>
        {[0, 2, 4, 6, 8].map(n => (
          <div key={n} className={`w-3 h-3 rounded-sm ${heatColor(n)}`} />
        ))}
        <span className="text-gray-600 text-xs">많음</span>
      </div>
    </div>
  );
}

export default function StatsView() {
  const {
    xp, streak, completedChallenges, wrongNotes, snippets,
    studyLog, recentResults, savedChallenges,
  } = useStore();

  const totalDays = Object.keys(studyLog).filter(k => studyLog[k] > 0).length;
  const totalActivities = Object.values(studyLog).reduce((a, b) => a + b, 0);
  const recentCorrect = recentResults.filter(Boolean).length;
  const recentTotal = recentResults.length;

  // 언어별 완료 문제 수
  const langCount = savedChallenges
    .filter(c => completedChallenges.includes(c.id))
    .reduce<Record<string, number>>((acc, c) => {
      acc[c.language] = (acc[c.language] ?? 0) + 1;
      return acc;
    }, {});
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const accuracy = recentTotal > 0 ? Math.round((recentCorrect / recentTotal) * 100) : null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center gap-2 px-4 md:px-6 py-4 border-b border-white/5 bg-[#1a1d2e] sticky top-0">
        <TrendingUp size={16} className="text-indigo-400" />
        <h2 className="text-white font-semibold text-sm">학습 통계</h2>
      </div>

      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto w-full">

        {/* 핵심 수치 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Flame size={18} className="text-orange-400" />, value: streak, label: '연속 학습일', color: 'text-orange-400' },
            { icon: <Star size={18} className="text-yellow-400" />,  value: xp,     label: '총 XP',      color: 'text-yellow-400' },
            { icon: <Trophy size={18} className="text-green-400" />, value: completedChallenges.length, label: '완료한 문제', color: 'text-green-400' },
            { icon: <Calendar size={18} className="text-indigo-400" />, value: totalDays, label: '학습한 날', color: 'text-indigo-400' },
          ].map(({ icon, value, label, color }) => (
            <div key={label} className="bg-[#1e2235] rounded-xl p-4 flex flex-col items-center gap-2">
              {icon}
              <span className={`text-2xl font-bold ${color}`}>{value}</span>
              <span className="text-gray-500 text-xs text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* 히트맵 */}
        <div className="bg-[#1e2235] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium text-sm flex items-center gap-2">
              <Calendar size={14} className="text-indigo-400" /> 학습 기록
            </h3>
            <span className="text-gray-500 text-xs">총 {totalActivities}회 활동</span>
          </div>
          {/* 데스크톱: 24주 / 모바일: 14주 */}
          <div className="hidden md:block"><Heatmap weeks={24} /></div>
          <div className="md:hidden"><Heatmap weeks={14} /></div>
        </div>

        {/* 정답률 */}
        {recentTotal > 0 && (
          <div className="bg-[#1e2235] rounded-xl p-4">
            <h3 className="text-white font-medium text-sm flex items-center gap-2 mb-4">
              <Target size={14} className="text-indigo-400" /> 최근 정답률
              <span className="text-gray-500 text-xs font-normal">(최근 {recentTotal}회)</span>
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#252840" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={accuracy! >= 70 ? '#22c55e' : accuracy! >= 40 ? '#eab308' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${accuracy} ${100 - accuracy!}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                  {accuracy}%
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">✅ 정답</span>
                  <span className="text-white font-medium">{recentCorrect}회</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">❌ 오답</span>
                  <span className="text-white font-medium">{recentTotal - recentCorrect}회</span>
                </div>
                <div className="w-full bg-[#252840] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${accuracy! >= 70 ? 'bg-green-500' : accuracy! >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 언어별 완료 */}
        {topLangs.length > 0 && (
          <div className="bg-[#1e2235] rounded-xl p-4">
            <h3 className="text-white font-medium text-sm flex items-center gap-2 mb-4">
              🏆 언어별 완료 문제
            </h3>
            <div className="space-y-2.5">
              {topLangs.map(([lang, count]) => {
                const max = topLangs[0][1];
                return (
                  <div key={lang} className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center">{LANGUAGE_ICONS[lang as keyof typeof LANGUAGE_ICONS]}</span>
                    <span className="text-gray-300 text-sm w-20">{LANGUAGE_LABELS[lang as keyof typeof LANGUAGE_LABELS]}</span>
                    <div className="flex-1 bg-[#252840] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 요약 */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '오답 노트', value: wrongNotes.length, emoji: '📝' },
            { label: '저장 스니펫', value: snippets.length, emoji: '💾' },
            { label: '저장된 문제', value: savedChallenges.length, emoji: '📚' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="bg-[#1e2235] rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-white font-bold text-lg">{value}</div>
              <div className="text-gray-500 text-xs">{label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
