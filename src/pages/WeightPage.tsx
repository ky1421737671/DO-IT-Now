import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useMemo, useState } from 'react';
import { Check, Scale, Target, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import type { WeightEntry, WeightProfile } from '../types';
import { todayISO } from '../utils/date';
import { createId } from '../utils/id';

interface WeightPageProps {
  profile: WeightProfile;
  setProfile: Dispatch<SetStateAction<WeightProfile>>;
  entries: WeightEntry[];
  setEntries: Dispatch<SetStateAction<WeightEntry[]>>;
}

const roundOne = (value: number) => Math.round(value * 10) / 10;

const formatNumber = (value: number) => {
  return Number.isFinite(value) ? roundOne(value).toFixed(1) : '--';
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const getEntryTime = (entry: WeightEntry) => entry.time ?? '00:00';

const getBmiLabel = (bmi: number) => {
  if (!Number.isFinite(bmi)) {
    return '未计算';
  }
  if (bmi < 18.5) {
    return '偏低';
  }
  if (bmi < 24) {
    return '正常';
  }
  if (bmi < 28) {
    return '偏高';
  }
  return '较高';
};

function WeightPage({ profile, setProfile, entries, setEntries }: WeightPageProps) {
  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => b.date.localeCompare(a.date) || getEntryTime(b).localeCompare(getEntryTime(a)),
      ),
    [entries],
  );
  const oldestToNewest = useMemo(
    () =>
      [...entries].sort(
        (a, b) => a.date.localeCompare(b.date) || getEntryTime(a).localeCompare(getEntryTime(b)),
      ),
    [entries],
  );
  const latestEntry = sortedEntries[0];
  const earliestEntry = oldestToNewest[0];
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(formatTime(new Date()));
  const [weightKg, setWeightKg] = useState(latestEntry?.weightKg.toString() ?? '');
  const [note, setNote] = useState('');

  const heightMeters = profile.heightCm / 100;
  const bmi = latestEntry && heightMeters > 0 ? latestEntry.weightKg / (heightMeters * heightMeters) : Number.NaN;
  const targetGap = latestEntry ? latestEntry.weightKg - profile.targetWeightKg : Number.NaN;
  const totalChange = latestEntry && earliestEntry ? latestEntry.weightKg - earliestEntry.weightKg : 0;
  const recentEntries = oldestToNewest.slice(-7);

  const saveEntry = (event: FormEvent) => {
    event.preventDefault();
    const nextWeight = Number(weightKg);

    if (!date || !Number.isFinite(nextWeight) || nextWeight <= 0) {
      return;
    }

    setEntries((currentEntries) => {
      const nextEntry: WeightEntry = {
        id: createId('weight'),
        date,
        time,
        weightKg: roundOne(nextWeight),
        note: note.trim(),
      };
      return [nextEntry, ...currentEntries].sort(
        (a, b) => b.date.localeCompare(a.date) || getEntryTime(b).localeCompare(getEntryTime(a)),
      );
    });
    setTime(formatTime(new Date()));
    setNote('');
  };

  const deleteEntry = (entryId: string) => {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId));
  };

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Scale className="h-4 w-4 text-teal-600" />
            当前体重
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {latestEntry ? `${formatNumber(latestEntry.weightKg)} kg` : '--'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {latestEntry ? `${latestEntry.date} ${getEntryTime(latestEntry)}` : '还没有记录'}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Target className="h-4 w-4 text-teal-600" />
            目标差距
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {Number.isFinite(targetGap) ? `${targetGap > 0 ? '+' : ''}${formatNumber(targetGap)} kg` : '--'}
          </p>
          <p className="mt-2 text-sm text-slate-500">目标 {formatNumber(profile.targetWeightKg)} kg</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            {totalChange <= 0 ? (
              <TrendingDown className="h-4 w-4 text-teal-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-rose-600" />
            )}
            记录变化
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {entries.length > 1 ? `${totalChange > 0 ? '+' : ''}${formatNumber(totalChange)} kg` : '--'}
          </p>
          <p className="mt-2 text-sm text-slate-500">{entries.length} 条记录</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="text-sm font-medium text-slate-500">BMI</div>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{Number.isFinite(bmi) ? formatNumber(bmi) : '--'}</p>
          <p className="mt-2 text-sm text-slate-500">{getBmiLabel(bmi)}</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="grid content-start gap-5">
          <form onSubmit={saveEntry} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-950">记录体重</h3>
              <button
                type="submit"
                className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
              >
                <Check className="h-4 w-4" />
                保存
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                日期
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                时间
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                体重 kg
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                  placeholder="例如：68.2"
                  className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                备注
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  placeholder="例如：早起空腹、运动后、饮食偏咸"
                  className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
                />
              </label>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <h3 className="text-base font-semibold text-slate-950">目标设置</h3>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                身高 cm
                <input
                  type="number"
                  min="80"
                  step="1"
                  value={profile.heightCm}
                  onChange={(event) =>
                    setProfile((currentProfile) => ({ ...currentProfile, heightCm: Number(event.target.value) }))
                  }
                  className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                目标体重 kg
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={profile.targetWeightKg}
                  onChange={(event) =>
                    setProfile((currentProfile) => ({
                      ...currentProfile,
                      targetWeightKg: Number(event.target.value),
                    }))
                  }
                  className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
                />
              </label>
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">体重趋势</h3>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
              最近 {recentEntries.length} 条
            </span>
          </div>

          <div className="mt-5 h-48 rounded-lg border border-slate-200 bg-slate-50 p-4">
            {recentEntries.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">暂无趋势数据。</div>
            )}
            {recentEntries.length > 0 && (
              <div className="flex h-full items-end gap-3">
                {recentEntries.map((entry) => {
                  const weights = recentEntries.map((item) => item.weightKg);
                  const minWeight = Math.min(...weights);
                  const maxWeight = Math.max(...weights);
                  const range = Math.max(maxWeight - minWeight, 1);
                  const heightPercent = 28 + ((entry.weightKg - minWeight) / range) * 62;

                  return (
                    <div key={entry.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                      <div className="flex h-32 w-full items-end justify-center">
                        <div
                          className="w-full max-w-12 rounded-t-lg bg-teal-500"
                          style={{ height: `${heightPercent}%` }}
                          title={`${entry.date} ${getEntryTime(entry)} ${formatNumber(entry.weightKg)} kg`}
                        />
                      </div>
                      <p className="text-xs font-medium text-slate-700">{formatNumber(entry.weightKg)}</p>
                      <p className="w-full truncate text-center text-xs text-slate-500">
                        {entry.date.slice(5)} {entry.time ? entry.time : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3">
            {sortedEntries.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                还没有体重记录。
              </div>
            )}

            {sortedEntries.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{entry.date} {entry.time ? entry.time : ''}</p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-950">{formatNumber(entry.weightKg)} kg</h4>
                    {entry.note && <p className="mt-2 text-sm leading-6 text-slate-600">{entry.note}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                    aria-label="删除记录"
                    title="删除记录"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

export default WeightPage;
