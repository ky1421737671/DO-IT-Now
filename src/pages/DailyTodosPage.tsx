import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { DailyTodo, DailyTodoCompletion, DailyTodoTemplate, RewardRecord } from '../types';
import { addDays, todayISO } from '../utils/date';
import { createId } from '../utils/id';

interface DailyTodosPageProps {
  todos: DailyTodo[];
  setTodos: Dispatch<SetStateAction<DailyTodo[]>>;
  templates: DailyTodoTemplate[];
  setTemplates: Dispatch<SetStateAction<DailyTodoTemplate[]>>;
  completions: DailyTodoCompletion[];
  setCompletions: Dispatch<SetStateAction<DailyTodoCompletion[]>>;
  onReward: (payload: { title: string; source: RewardRecord['source']; points?: number }) => void;
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const formatDateLabel = (dateISO: string) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${dateISO}T00:00:00`));
};

function DailyTodosPage({
  todos,
  setTodos,
  templates,
  setTemplates,
  completions,
  setCompletions,
  onReward,
}: DailyTodosPageProps) {
  const [title, setTitle] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const today = todayISO();
  const selectedDateCompletions = completions.filter((completion) => completion.completedDate === selectedDate);
  const historyGroups = completions
    .filter((completion) => completion.completedDate !== selectedDate)
    .reduce<Record<string, DailyTodoCompletion[]>>((groups, completion) => {
      groups[completion.completedDate] = [...(groups[completion.completedDate] ?? []), completion];
      return groups;
    }, {});
  const historyDates = Object.keys(historyGroups).sort((a, b) => b.localeCompare(a));
  const recordTitle = selectedDate === today ? '今日已完成' : `${formatDateLabel(selectedDate)} 已完成`;
  const emptyRecordText =
    selectedDate === today
      ? '今天还没有完成记录。'
      : selectedDate < today
        ? '这一天还没有完成记录。'
        : '未来这一天还没有记录。';

  useEffect(() => {
    setTodos((currentTodos) => {
      let changed = false;
      let nextTodos = currentTodos;

      templates
        .filter((template) => template.enabled)
        .forEach((template) => {
        const completedToday = completions.some(
          (completion) => completion.recurringKey === template.id && completion.completedDate === today,
        );
        const existingTodo = nextTodos.find((todo) => todo.recurringKey === template.id);

        if (completedToday && existingTodo) {
          changed = true;
          nextTodos = nextTodos.filter((todo) => todo.recurringKey !== template.id);
          return;
        }

        if (!completedToday && existingTodo && (existingTodo.createdAt !== today || existingTodo.title !== template.title)) {
          changed = true;
          nextTodos = nextTodos.map((todo) =>
            todo.recurringKey === template.id ? { ...todo, title: template.title, createdAt: today } : todo,
          );
          return;
        }

        if (!completedToday && !existingTodo) {
          changed = true;
          nextTodos = [
            {
              id: createId('daily-fixed'),
              title: template.title,
              createdAt: today,
              recurringKey: template.id,
            },
            ...nextTodos,
          ];
        }
      });

      return changed ? nextTodos : currentTodos;
    });
  }, [completions, setTodos, templates, today]);

  useEffect(() => {
    setTodos((currentTodos) => {
      const enabledTemplateIds = new Set(templates.filter((template) => template.enabled).map((template) => template.id));
      const nextTodos = currentTodos.filter((todo) => !todo.recurringKey || enabledTemplateIds.has(todo.recurringKey));
      return nextTodos.length === currentTodos.length ? currentTodos : nextTodos;
    });
  }, [setTodos, templates]);

  const addTodo = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const recurringKey = isRecurring ? createId('daily-template') : undefined;

    if (recurringKey) {
      setTemplates((currentTemplates) => [
        {
          id: recurringKey,
          title: trimmedTitle,
          createdAt: todayISO(),
          enabled: true,
        },
        ...currentTemplates,
      ]);
    }

    setTodos((currentTodos) => [
      {
        id: createId('daily-todo'),
        title: trimmedTitle,
        createdAt: todayISO(),
        recurringKey,
      },
      ...currentTodos,
    ]);
    setTitle('');
    setIsRecurring(false);
  };

  const completeTodo = (todo: DailyTodo) => {
    setTodos((currentTodos) => currentTodos.filter((currentTodo) => currentTodo.id !== todo.id));
    setCompletions((currentCompletions) => [
      {
        id: createId('daily-done'),
        title: todo.title,
        completedDate: todayISO(),
        completedAt: formatTime(new Date()),
        recurringKey: todo.recurringKey,
      },
      ...currentCompletions,
    ]);
    onReward({ title: todo.title, source: '每日待办' });
  };

  const removeTodo = (todo: DailyTodo) => {
    if (todo.recurringKey) {
      setTemplates((currentTemplates) =>
        currentTemplates.map((template) =>
          template.id === todo.recurringKey ? { ...template, enabled: false } : template,
        ),
      );
      setTodos((currentTodos) => currentTodos.filter((currentTodo) => currentTodo.recurringKey !== todo.recurringKey));
      return;
    }

    setTodos((currentTodos) => currentTodos.filter((currentTodo) => currentTodo.id !== todo.id));
  };

  const shiftSelectedDate = (days: number) => {
    setSelectedDate((currentDate) => addDays(currentDate, days));
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={addTodo} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">添加待办</h3>
            <button
              type="submit"
              className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              添加
            </button>
          </div>
          <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-700">
            待办事项
            <textarea
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              rows={5}
              placeholder="例如：买资料、整理错题、预约打印"
              className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
            />
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(event) => setIsRecurring(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            设为每日固定
          </label>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">每日待办</h3>
            <span className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
              {todos.length} 项
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {todos.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                暂无待办。
              </div>
            )}

            {todos.map((todo) => (
              <article key={todo.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => completeTodo(todo)}
                    className="focus-ring mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white"
                    aria-label="完成并记录"
                    title="完成并记录"
                  >
                    <Check className="h-4 w-4" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold leading-6 text-slate-950">{todo.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{todo.createdAt}</span>
                      {todo.recurringKey && (
                        <span className="rounded-lg border border-teal-100 bg-teal-50 px-2 py-0.5 text-teal-700">
                          每日固定
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTodo(todo)}
                    className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                    aria-label={todo.recurringKey ? '删除固定待办' : '删除待办'}
                    title={todo.recurringKey ? '删除固定待办' : '删除待办'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950">{recordTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">{selectedDate}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => shiftSelectedDate(-1)}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="查看前一天"
              title="查看前一天"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <label className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="focus-ring min-h-10 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-700"
                aria-label="选择记录日期"
              />
            </label>
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-700 hover:bg-teal-100"
            >
              今天
            </button>
            <button
              type="button"
              onClick={() => shiftSelectedDate(1)}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="查看后一天"
              title="查看后一天"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
              {selectedDateCompletions.length} 项
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {selectedDateCompletions.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              {emptyRecordText}
            </div>
          )}

          {selectedDateCompletions.map((completion) => (
            <article key={completion.id} className="rounded-lg border border-teal-100 bg-teal-50 p-4">
              <p className="break-words text-sm font-semibold leading-6 text-slate-950">{completion.title}</p>
              <p className="mt-2 text-xs text-teal-700">完成于 {completion.completedAt}</p>
            </article>
          ))}
        </div>
      </section>

      {historyDates.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">历史记录</h3>
          <div className="mt-4 grid gap-4">
            {historyDates.map((date) => (
              <article key={date} className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-950">{formatDateLabel(date)}</h4>
                  <span className="text-xs text-slate-500">{historyGroups[date].length} 项</span>
                </div>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {historyGroups[date].map((completion) => (
                    <div key={completion.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="break-words text-sm font-medium text-slate-800">{completion.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{completion.completedAt}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DailyTodosPage;
