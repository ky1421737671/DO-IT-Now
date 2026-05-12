import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import type { DailyTodo, DailyTodoCompletion } from '../types';
import { todayISO } from '../utils/date';
import { createId } from '../utils/id';

interface DailyTodosPageProps {
  todos: DailyTodo[];
  setTodos: Dispatch<SetStateAction<DailyTodo[]>>;
  completions: DailyTodoCompletion[];
  setCompletions: Dispatch<SetStateAction<DailyTodoCompletion[]>>;
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

function DailyTodosPage({ todos, setTodos, completions, setCompletions }: DailyTodosPageProps) {
  const [title, setTitle] = useState('');
  const today = todayISO();
  const todayCompletions = completions.filter((completion) => completion.completedDate === today);
  const historyGroups = completions
    .filter((completion) => completion.completedDate !== today)
    .reduce<Record<string, DailyTodoCompletion[]>>((groups, completion) => {
      groups[completion.completedDate] = [...(groups[completion.completedDate] ?? []), completion];
      return groups;
    }, {});
  const historyDates = Object.keys(historyGroups).sort((a, b) => b.localeCompare(a));

  const addTodo = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    setTodos((currentTodos) => [
      {
        id: createId('daily-todo'),
        title: trimmedTitle,
        createdAt: todayISO(),
      },
      ...currentTodos,
    ]);
    setTitle('');
  };

  const completeTodo = (todo: DailyTodo) => {
    setTodos((currentTodos) => currentTodos.filter((currentTodo) => currentTodo.id !== todo.id));
    setCompletions((currentCompletions) => [
      {
        id: createId('daily-done'),
        title: todo.title,
        completedDate: todayISO(),
        completedAt: formatTime(new Date()),
      },
      ...currentCompletions,
    ]);
  };

  const removeTodo = (todoId: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));
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
                    <p className="mt-1 text-xs text-slate-500">{todo.createdAt}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTodo(todo.id)}
                    className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                    aria-label="删除待办"
                    title="删除待办"
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
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950">今日已完成</h3>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
            {todayCompletions.length} 项
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {todayCompletions.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              今天还没有完成记录。
            </div>
          )}

          {todayCompletions.map((completion) => (
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
