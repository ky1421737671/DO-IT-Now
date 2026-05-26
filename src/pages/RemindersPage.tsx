import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useState } from 'react';
import { BellPlus, Check, RotateCw, Trash2 } from 'lucide-react';
import { priorityMeta } from '../constants';
import type { HabitReminder, RewardRecord, StudyTask } from '../types';
import { todayISO, tomorrowISO } from '../utils/date';
import { createId } from '../utils/id';

interface RemindersPageProps {
  tasks: StudyTask[];
  habits: HabitReminder[];
  setTasks: Dispatch<SetStateAction<StudyTask[]>>;
  setHabits: Dispatch<SetStateAction<HabitReminder[]>>;
  onReward: (payload: { title: string; source: RewardRecord['source']; points?: number }) => void;
}

function RemindersPage({ tasks, habits, setTasks, setHabits, onReward }: RemindersPageProps) {
  const [habitTitle, setHabitTitle] = useState('');
  const [habitTime, setHabitTime] = useState('08:00');
  const today = todayISO();
  const tomorrow = tomorrowISO();
  const todayTasks = tasks
    .filter((task) => !task.completed && task.dueDate === today)
    .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  const overdueTasks = tasks.filter((task) => !task.completed && task.dueDate < today);
  const tomorrowTasks = tasks
    .filter((task) => !task.completed && task.dueDate === tomorrow)
    .sort((a, b) => a.dueTime.localeCompare(b.dueTime));

  const markDone = (taskId: string) => {
    const targetTask = tasks.find((task) => task.id === taskId);

    if (targetTask && !targetTask.completed) {
      onReward({ title: targetTask.title, source: '今日任务' });
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task)),
    );
  };

  const postponeTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, dueDate: tomorrow, rolledFrom: task.rolledFrom ?? task.dueDate } : task,
      ),
    );
  };

  const addHabit = (event: FormEvent) => {
    event.preventDefault();
    if (!habitTitle.trim()) {
      return;
    }

    setHabits((currentHabits) => [
      {
        id: createId('habit'),
        title: habitTitle.trim(),
        time: habitTime,
        enabled: true,
      },
      ...currentHabits,
    ]);
    setHabitTitle('');
  };

  const toggleHabit = (habitId: string) => {
    setHabits((currentHabits) =>
      currentHabits.map((habit) => (habit.id === habitId ? { ...habit, enabled: !habit.enabled } : habit)),
    );
  };

  const removeHabit = (habitId: string) => {
    setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== habitId));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">今日提醒</h3>
          <div className="mt-4 grid gap-3">
            {todayTasks.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                今日暂无未完成任务。
              </p>
            )}
            {todayTasks.map((task) => {
              const priority = priorityMeta[task.priority];
              return (
                <article key={task.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-semibold leading-6 text-slate-950">{task.title}</h4>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className={`rounded-lg border px-2 py-1 ${priority.className}`}>优先级 {priority.label}</span>
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">截止 {task.dueTime}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => markDone(task.id)}
                      className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-700 hover:bg-teal-100"
                    >
                      <Check className="h-4 w-4" />
                      完成
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">逾期任务提醒</h3>
          <div className="mt-4 grid gap-3">
            {overdueTasks.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                暂无逾期任务。
              </p>
            )}
            {overdueTasks.map((task) => (
              <article key={task.id} className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-semibold leading-6 text-rose-950">{task.title}</h4>
                    <p className="mt-1 text-sm text-rose-700">原截止：{task.dueDate} {task.dueTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => postponeTask(task.id)}
                      className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 hover:bg-rose-100"
                    >
                      <RotateCw className="h-4 w-4" />
                      顺延
                    </button>
                    <button
                      type="button"
                      onClick={() => markDone(task.id)}
                      className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-rose-600 px-3 text-sm font-medium text-white hover:bg-rose-700"
                    >
                      <Check className="h-4 w-4" />
                      完成
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">明日任务预览</h3>
          <div className="mt-4 grid gap-3">
            {tomorrowTasks.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                明天还没有任务。
              </p>
            )}
            {tomorrowTasks.map((task) => (
              <p key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {task.dueTime} · {task.title}
              </p>
            ))}
          </div>
        </section>
      </div>

      <aside className="grid content-start gap-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">固定习惯</h3>
          <div className="mt-4 grid gap-3">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                <label className="flex min-w-0 flex-1 items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={habit.enabled}
                    onChange={() => toggleHabit(habit.id)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="min-w-0 flex-1 truncate">{habit.title}</span>
                  <span className="text-slate-500">{habit.time}</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeHabit(habit.id)}
                  className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                  aria-label="删除习惯"
                  title="删除习惯"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={addHabit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">新增习惯提醒</h3>
            <button
              type="submit"
              className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
            >
              <BellPlus className="h-4 w-4" />
              添加
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              提醒内容
              <input
                value={habitTitle}
                onChange={(event) => setHabitTitle(event.target.value)}
                placeholder="例如：午间背单词"
                className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              时间
              <input
                type="time"
                value={habitTime}
                onChange={(event) => setHabitTime(event.target.value)}
                className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default RemindersPage;
