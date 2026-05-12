import type { ComponentType, ReactNode } from 'react';
import type { PageKey } from '../types';

interface NavItem {
  key: PageKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface LayoutProps {
  navItems: NavItem[];
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  reminderCounts: {
    overdue: number;
    todayTasks: number;
  };
  children: ReactNode;
}

const pageTitles: Record<PageKey, string> = {
  home: '今天该做什么',
  todos: '每日待办',
  plan: '考研计划',
  reminders: '提醒',
  memos: '备忘',
};

const formatDate = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());
};

function Layout({ navItems, activePage, onNavigate, reminderCounts, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-800">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="mb-5 flex items-center justify-between gap-3 lg:block">
            <div>
              <p className="text-sm font-medium text-teal-700">每日计划</p>
              <h1 className="mt-2 inline-flex items-center rounded-lg bg-slate-950 px-3 py-2 text-2xl font-black leading-none text-white shadow-sm">
                <span className="text-teal-300">即</span>
                <span>做</span>
              </h1>
            </div>
            <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-right lg:mt-5 lg:text-left">
              <p className="text-xs text-slate-500">今日待完成</p>
              <p className="text-lg font-semibold text-teal-700">{reminderCounts.todayTasks} 项</p>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  className={`focus-ring flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition lg:justify-start ${
                    isActive
                      ? 'border-teal-200 bg-teal-50 text-teal-800'
                      : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.key === 'reminders' && reminderCounts.overdue > 0 && (
                    <span className="ml-auto hidden min-w-5 rounded-full bg-rose-100 px-1.5 text-center text-xs text-rose-700 lg:inline">
                      {reminderCounts.overdue}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">{formatDate()}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{pageTitles[activePage]}</h2>
            </div>
            {reminderCounts.overdue > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('reminders')}
                className="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                有 {reminderCounts.overdue} 项逾期任务
              </button>
            )}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
