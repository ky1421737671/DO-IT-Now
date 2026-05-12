import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Priority, StudyTask, SubjectPlan } from '../types';
import { todayISO } from '../utils/date';
import { createId } from '../utils/id';

interface TaskFormProps {
  subjects: SubjectPlan[];
  onAddTask: (task: StudyTask) => void;
}

function TaskForm({ subjects, onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [dueDate, setDueDate] = useState(todayISO());
  const [dueTime, setDueTime] = useState('09:00');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [autoRollOver, setAutoRollOver] = useState(true);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    onAddTask({
      id: createId('task'),
      title: trimmedTitle,
      priority,
      estimatedMinutes,
      dueDate,
      dueTime,
      completed: false,
      autoRollOver,
      createdAt: todayISO(),
      source: 'manual',
      subjectId: subjectId || undefined,
    });

    setTitle('');
    setEstimatedMinutes(60);
    setDueDate(todayISO());
    setDueTime('09:00');
    setAutoRollOver(true);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-950">新增今日任务</h3>
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
          任务内容
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：数学强化课第 3 讲 + 对应习题"
            className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 placeholder:text-slate-400"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            科目
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="">不绑定科目</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            优先级
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
              className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            预计用时
            <input
              type="number"
              min={10}
              step={5}
              value={estimatedMinutes}
              onChange={(event) => setEstimatedMinutes(Number(event.target.value))}
              className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            截止日期
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            截止时间
            <input
              type="time"
              value={dueTime}
              onChange={(event) => setDueTime(event.target.value)}
              className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={autoRollOver}
            onChange={(event) => setAutoRollOver(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          未完成时下次打开自动顺延到当天
        </label>
      </div>
    </form>
  );
}

export default TaskForm;
