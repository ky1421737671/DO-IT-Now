import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useState } from 'react';
import { ClipboardPlus, Plus, Trash2 } from 'lucide-react';
import type { Memo, StudyTask } from '../types';
import { todayISO } from '../utils/date';
import { createId } from '../utils/id';

interface MemosPageProps {
  memos: Memo[];
  setMemos: Dispatch<SetStateAction<Memo[]>>;
  setTasks: Dispatch<SetStateAction<StudyTask[]>>;
}

function MemosPage({ memos, setMemos, setTasks }: MemosPageProps) {
  const [content, setContent] = useState('');

  const addMemo = (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }

    setMemos((currentMemos) => [
      {
        id: createId('memo'),
        content: content.trim(),
        createdAt: todayISO(),
      },
      ...currentMemos,
    ]);
    setContent('');
  };

  const removeMemo = (memoId: string) => {
    setMemos((currentMemos) => currentMemos.filter((memo) => memo.id !== memoId));
  };

  const convertToTask = (memo: Memo) => {
    setTasks((currentTasks) => [
      {
        id: createId('task-memo'),
        title: memo.content,
        priority: 'medium',
        estimatedMinutes: 30,
        dueDate: todayISO(),
        dueTime: '18:00',
        completed: false,
        autoRollOver: true,
        createdAt: todayISO(),
        source: 'memo',
      },
      ...currentTasks,
    ]);
    removeMemo(memo.id);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <form onSubmit={addMemo} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950">简单备忘</h3>
          <button
            type="submit"
            className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            添加
          </button>
        </div>
        <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-700">
          临时事项或复习注意事项
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={8}
            placeholder="例如：数学错题本周六集中回看；英语作文模板需要重新压缩。"
            className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
          />
        </label>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h3 className="text-base font-semibold text-slate-950">备忘列表</h3>
        <div className="mt-4 grid gap-3">
          {memos.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              暂无备忘。
            </div>
          )}
          {memos.map((memo) => (
            <article key={memo.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm leading-6 text-slate-800">{memo.content}</p>
                  <p className="mt-2 text-xs text-slate-500">{memo.createdAt}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => convertToTask(memo)}
                    className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-700 hover:bg-teal-100"
                  >
                    <ClipboardPlus className="h-4 w-4" />
                    转任务
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMemo(memo.id)}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                    aria-label="删除备忘"
                    title="删除备忘"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MemosPage;
