import { Check, Clock, RotateCw, Trash2 } from 'lucide-react';
import { priorityMeta } from '../constants';
import type { StudyTask, SubjectPlan } from '../types';
import { formatMinutes } from '../utils/date';

interface TaskListProps {
  title?: string;
  tasks: StudyTask[];
  subjects: SubjectPlan[];
  emptyText: string;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onPostponeTask: (taskId: string) => void;
}

const getSubjectName = (subjects: SubjectPlan[], subjectId?: string) => {
  return subjects.find((subject) => subject.id === subjectId)?.name;
};

function TaskList({
  title = '今日任务',
  tasks,
  subjects,
  emptyText,
  onToggleTask,
  onDeleteTask,
  onPostponeTask,
}: TaskListProps) {
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {tasks.length ? `已完成 ${completedCount} / ${tasks.length}` : emptyText}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            {emptyText}
          </div>
        )}

        {tasks.map((task) => {
          const priority = priorityMeta[task.priority];
          const subjectName = getSubjectName(subjects, task.subjectId);

          return (
            <article
              key={task.id}
              className={`rounded-lg border p-4 transition ${
                task.completed ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className={`focus-ring mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    task.completed ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300 text-transparent'
                  }`}
                  aria-label={task.completed ? '标记为未完成' : '标记为完成'}
                  title={task.completed ? '标记为未完成' : '标记为完成'}
                >
                  <Check className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4
                        className={`break-words text-sm font-semibold leading-6 ${
                          task.completed ? 'line-through decoration-slate-400' : 'text-slate-950'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {subjectName && (
                          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                            {subjectName}
                          </span>
                        )}
                        <span className={`rounded-lg border px-2 py-1 ${priority.className}`}>
                          优先级 {priority.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatMinutes(task.estimatedMinutes)}
                        </span>
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                          {task.dueDate} {task.dueTime}
                        </span>
                        {task.rolledFrom && (
                          <span className="rounded-lg border border-teal-100 bg-teal-50 px-2 py-1 text-teal-700">
                            已从 {task.rolledFrom} 顺延
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {!task.completed && (
                        <button
                          type="button"
                          onClick={() => onPostponeTask(task.id)}
                          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-teal-700"
                          aria-label="顺延到明天"
                          title="顺延到明天"
                        >
                          <RotateCw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        aria-label="删除任务"
                        title="删除任务"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default TaskList;
