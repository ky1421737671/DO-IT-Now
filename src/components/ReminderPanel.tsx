import { AlertCircle, Bell, CalendarClock } from 'lucide-react';
import type { HabitReminder, StudyTask } from '../types';
import { todayISO, tomorrowISO } from '../utils/date';

interface ReminderPanelProps {
  tasks: StudyTask[];
  habits: HabitReminder[];
  onOpenReminders: () => void;
}

function ReminderPanel({ tasks, habits, onOpenReminders }: ReminderPanelProps) {
  const today = todayISO();
  const todayTasks = tasks
    .filter((task) => !task.completed && task.dueDate === today)
    .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  const overdueTasks = tasks.filter((task) => !task.completed && task.dueDate < today);
  const tomorrowTasks = tasks.filter((task) => !task.completed && task.dueDate === tomorrowISO());
  const activeHabits = habits.filter((habit) => habit.enabled).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <aside className="grid gap-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950">今日提醒</h3>
          <button
            type="button"
            onClick={onOpenReminders}
            className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            查看
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {overdueTasks.length > 0 && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                {overdueTasks.length} 项任务已逾期
              </div>
            </div>
          )}

          {activeHabits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="text-sm font-medium text-slate-700">{habit.title}</span>
              <span className="text-sm text-slate-500">{habit.time}</span>
            </div>
          ))}

          {todayTasks.slice(0, 4).map((task) => (
            <div key={task.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium leading-5 text-slate-800">{task.title}</p>
              <p className="mt-1 text-xs text-slate-500">截止 {task.dueTime}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-teal-600" />
          <h3 className="text-base font-semibold text-slate-950">明日预览</h3>
        </div>
        <div className="mt-4 grid gap-2">
          {tomorrowTasks.length === 0 && <p className="text-sm text-slate-500">明天还没有安排任务。</p>}
          {tomorrowTasks.slice(0, 5).map((task) => (
            <p key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {task.dueTime} {task.title}
            </p>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default ReminderPanel;
