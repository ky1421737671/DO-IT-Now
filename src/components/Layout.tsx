import { useState, type ComponentType, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import type { ConfigurablePageKey, NavModulePreference, PageKey } from '../types';

interface NavItem {
  key: PageKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface LayoutProps {
  navItems: NavItem[];
  moduleItems: NavItem[];
  modulePreferences: NavModulePreference[];
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  onToggleModule: (key: ConfigurablePageKey) => void;
  onMoveModule: (key: ConfigurablePageKey, direction: 'up' | 'down') => void;
  reminderCounts: {
    overdue: number;
    todayTasks: number;
  };
  children: ReactNode;
}

const pageTitles: Record<PageKey, string> = {
  home: '今天该做什么',
  goals: '长期目标',
  todos: '每日待办',
  rewards: '奖励中心',
  plan: '考研计划',
  reminders: '提醒',
  memos: '备忘',
  weight: '轻体记录',
};

const formatDate = () => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());
};

function Layout({
  navItems,
  moduleItems,
  modulePreferences,
  activePage,
  onNavigate,
  onToggleModule,
  onMoveModule,
  reminderCounts,
  children,
}: LayoutProps) {
  const [isModuleManagerOpen, setIsModuleManagerOpen] = useState(false);
  const moduleItemMap = new Map(moduleItems.map((item) => [item.key, item]));
  const canOpenReminders = navItems.some((item) => item.key === 'reminders');

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-800">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="mb-5 flex items-center justify-between gap-3 lg:block">
            <div className="flex items-center gap-3">
              <img
                src="jizuo-logo.png"
                alt=""
                className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover shadow-sm"
              />
              <div>
                <p className="text-sm font-medium text-teal-700">每日计划</p>
                <h1 className="mt-2 inline-flex items-center rounded-lg bg-slate-950 px-3 py-2 text-2xl font-black leading-none text-white shadow-sm">
                  <span className="text-teal-300">即</span>
                  <span>做</span>
                </h1>
              </div>
            </div>
            <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-right lg:mt-5 lg:text-left">
              <p className="text-xs text-slate-500">今日待完成</p>
              <p className="text-lg font-semibold text-teal-700">{reminderCounts.todayTasks} 项</p>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
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

          <div className="mt-3">
            <button
              type="button"
              onClick={() => setIsModuleManagerOpen((isOpen) => !isOpen)}
              className="focus-ring flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 lg:justify-start"
              aria-expanded={isModuleManagerOpen}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">模块管理</span>
            </button>

            {isModuleManagerOpen && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs leading-5 text-slate-500">首页固定，其余模块可显示或调整顺序。</p>
                <div className="mt-3 grid gap-2">
                  {modulePreferences.map((preference, index) => {
                    const moduleItem = moduleItemMap.get(preference.key);

                    if (!moduleItem) {
                      return null;
                    }

                    const Icon = moduleItem.icon;
                    const isFirst = index === 0;
                    const isLast = index === modulePreferences.length - 1;

                    return (
                      <div
                        key={preference.key}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2"
                      >
                        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={preference.visible}
                            onChange={() => onToggleModule(preference.key)}
                            className="h-4 w-4 rounded border-slate-300 text-teal-600"
                          />
                          <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                          <span className="truncate">{moduleItem.label}</span>
                        </label>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => onMoveModule(preference.key, 'up')}
                            disabled={isFirst}
                            className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`${moduleItem.label} 上移`}
                            title="上移"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveModule(preference.key, 'down')}
                            disabled={isLast}
                            className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`${moduleItem.label} 下移`}
                            title="下移"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">{formatDate()}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{pageTitles[activePage]}</h2>
            </div>
            {reminderCounts.overdue > 0 && canOpenReminders && (
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
