import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useMemo, useState } from 'react';
import { CheckCircle2, Flag, Plus, Trash2 } from 'lucide-react';
import type { LongTermGoal, RewardRecord } from '../types';
import { addDays, getDaysBetween, todayISO } from '../utils/date';
import { createId } from '../utils/id';

interface LongTermGoalsPageProps {
  goals: LongTermGoal[];
  setGoals: Dispatch<SetStateAction<LongTermGoal[]>>;
  onReward: (payload: { title: string; source: RewardRecord['source']; points?: number }) => void;
}

const getCountdownText = (goal: LongTermGoal) => {
  if (goal.completed) {
    return '已完成';
  }

  if (!goal.targetDate) {
    return '未设置';
  }

  const daysLeft = getDaysBetween(todayISO(), goal.targetDate);

  if (daysLeft > 0) {
    return `${daysLeft} 天`;
  }

  if (daysLeft === 0) {
    return '今天';
  }

  return `已过 ${Math.abs(daysLeft)} 天`;
};

const getProgress = (goal: LongTermGoal) => {
  if (goal.completed) {
    return 100;
  }

  if (!goal.targetDate) {
    return 0;
  }

  const totalDays = Math.max(1, getDaysBetween(goal.createdAt, goal.targetDate));
  const usedDays = Math.max(0, getDaysBetween(goal.createdAt, todayISO()));
  return Math.min(100, Math.max(6, Math.round((usedDays / totalDays) * 100)));
};

function LongTermGoalsPage({ goals, setGoals, onReward }: LongTermGoalsPageProps) {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(addDays(todayISO(), 30));
  const [stage, setStage] = useState('');
  const [note, setNote] = useState('');

  const sortedGoals = useMemo(
    () =>
      [...goals].sort(
        (first, second) =>
          Number(first.completed) - Number(second.completed) || first.targetDate.localeCompare(second.targetDate),
      ),
    [goals],
  );

  const activeGoals = goals.filter((goal) => !goal.completed);
  const nearestGoal = activeGoals
    .slice()
    .sort((first, second) => first.targetDate.localeCompare(second.targetDate))[0];

  const addGoal = (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !targetDate) {
      return;
    }

    const nextGoal: LongTermGoal = {
      id: createId('goal'),
      title: title.trim(),
      targetDate,
      stage: stage.trim() || '准备阶段',
      note: note.trim() || '先补充目标拆解和当前阶段重点。',
      completed: false,
      createdAt: todayISO(),
    };

    setGoals((currentGoals) => [nextGoal, ...currentGoals]);
    setTitle('');
    setTargetDate(addDays(todayISO(), 30));
    setStage('');
    setNote('');
  };

  const updateGoal = (goalId: string, patch: Partial<LongTermGoal>) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => (goal.id === goalId ? { ...goal, ...patch } : goal)),
    );
  };

  const removeGoal = (goalId: string) => {
    setGoals((currentGoals) => currentGoals.filter((goal) => goal.id !== goalId));
  };

  const toggleGoalComplete = (goal: LongTermGoal) => {
    if (!goal.completed) {
      onReward({ title: goal.title, source: '长期目标', points: 20 });
    }

    updateGoal(goal.id, { completed: !goal.completed });
  };

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">长期目标</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              放六级、教资、阶段测评这类独立目标，只记录目标日期、当前阶段和下一步方向。
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">进行中</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{activeGoals.length}</p>
          </div>
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
            <p className="text-sm text-slate-500">最近目标</p>
            <p className="mt-2 text-lg font-semibold text-teal-800">
              {nearestGoal ? `${nearestGoal.title} · ${getCountdownText(nearestGoal)}` : '暂无'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={addGoal} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">添加目标</h3>
            <button
              type="submit"
              className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              添加
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              目标名称
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例如：英语六级考试"
                required
                className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              目标日期
              <input
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                required
                className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              当前阶段
              <input
                value={stage}
                onChange={(event) => setStage(event.target.value)}
                placeholder="例如：真题强化阶段"
                className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              目标说明
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={5}
                placeholder="例如：每天听力 30 分钟，每周完成 2 套真题。"
                className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
              />
            </label>
          </div>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">目标列表</h3>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
              {goals.length} 项
            </span>
          </div>

          <div className="mt-4 grid gap-4">
            {sortedGoals.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                暂无长期目标。
              </div>
            )}

            {sortedGoals.map((goal) => {
              const progress = getProgress(goal);

              return (
                <article key={goal.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Flag className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs text-slate-500">距离目标</p>
                        <p className="text-lg font-black text-slate-950">{getCountdownText(goal)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleGoalComplete(goal)}
                        className={`focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${
                          goal.completed
                            ? 'border-teal-200 bg-teal-50 text-teal-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {goal.completed ? '已完成' : '完成'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGoal(goal.id)}
                        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        aria-label="删除长期目标"
                        title="删除长期目标"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                      目标名称
                      <input
                        value={goal.title}
                        onChange={(event) => updateGoal(goal.id, { title: event.target.value })}
                        className="focus-ring min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-950"
                      />
                    </label>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                        目标日期
                        <input
                          type="date"
                          value={goal.targetDate}
                          onChange={(event) => updateGoal(goal.id, { targetDate: event.target.value })}
                          className="focus-ring min-h-10 rounded-lg border border-slate-200 px-3 text-sm"
                        />
                      </label>

                      <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                        当前阶段
                        <input
                          value={goal.stage}
                          onChange={(event) => updateGoal(goal.id, { stage: event.target.value })}
                          className="focus-ring min-h-10 rounded-lg border border-slate-200 px-3 text-sm"
                        />
                      </label>
                    </div>

                    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                      目标说明
                      <textarea
                        value={goal.note}
                        onChange={(event) => updateGoal(goal.id, { note: event.target.value })}
                        rows={3}
                        className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
                      />
                    </label>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>阶段推进</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-teal-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LongTermGoalsPage;
