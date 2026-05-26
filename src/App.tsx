import { useEffect, useMemo, useState } from 'react';
import { Award, Bell, CalendarCheck, ClipboardList, Flag, ListTodo, NotebookPen, Scale, Sparkles } from 'lucide-react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PlanPage from './pages/PlanPage';
import RemindersPage from './pages/RemindersPage';
import MemosPage from './pages/MemosPage';
import DailyTodosPage from './pages/DailyTodosPage';
import WeightPage from './pages/WeightPage';
import LongTermGoalsPage from './pages/LongTermGoalsPage';
import RewardsPage from './pages/RewardsPage';
import {
  initialDailyTodoCompletions,
  initialDailyTodoTemplates,
  initialDailyTodos,
  initialHabits,
  initialLongTermGoals,
  initialMemos,
  initialPlan,
  initialRewardRecords,
  initialTasks,
  initialWeightEntries,
  initialWeightProfile,
} from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createId } from './utils/id';
import type {
  ConfigurablePageKey,
  DailyTodo,
  DailyTodoCompletion,
  DailyTodoTemplate,
  ExamPlan,
  HabitReminder,
  LongTermGoal,
  Memo,
  NavModulePreference,
  PageKey,
  RewardRecord,
  StudyTask,
  WeightEntry,
  WeightProfile,
} from './types';
import { todayISO } from './utils/date';

const navItems = [
  { key: 'home' as const, label: '首页', icon: ClipboardList },
  { key: 'goals' as const, label: '长期目标', icon: Flag },
  { key: 'todos' as const, label: '每日待办', icon: ListTodo },
  { key: 'rewards' as const, label: '奖励中心', icon: Award },
  { key: 'plan' as const, label: '考研计划', icon: CalendarCheck },
  { key: 'reminders' as const, label: '提醒', icon: Bell },
  { key: 'memos' as const, label: '备忘', icon: NotebookPen },
  { key: 'weight' as const, label: '轻体记录', icon: Scale },
];

const configurableModuleKeys: ConfigurablePageKey[] = [
  'goals',
  'todos',
  'rewards',
  'plan',
  'reminders',
  'memos',
  'weight',
];

const defaultModulePreferences: NavModulePreference[] = configurableModuleKeys.map((key) => ({
  key,
  visible: true,
}));

const moduleNavItems = configurableModuleKeys
  .map((key) => navItems.find((item) => item.key === key))
  .filter((item): item is NonNullable<typeof item> => Boolean(item));

const normalizeModulePreferences = (preferences: NavModulePreference[]) => {
  const knownKeys = new Set<ConfigurablePageKey>(configurableModuleKeys);
  const seenKeys = new Set<ConfigurablePageKey>();
  const normalized: NavModulePreference[] = [];

  preferences.forEach((preference) => {
    if (knownKeys.has(preference.key) && !seenKeys.has(preference.key)) {
      normalized.push({ key: preference.key, visible: preference.visible });
      seenKeys.add(preference.key);
    }
  });

  configurableModuleKeys.forEach((key) => {
    if (!seenKeys.has(key)) {
      normalized.push({ key, visible: true });
    }
  });

  return normalized;
};

const formatRewardTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

function App() {
  const [activePage, setActivePage] = useState<PageKey>('home');
  const [rewardFeedback, setRewardFeedback] = useState<RewardRecord | null>(null);
  const [tasks, setTasks] = useLocalStorage<StudyTask[]>('kaoyan.tasks', initialTasks);
  const [plan, setPlan] = useLocalStorage<ExamPlan>('kaoyan.plan', initialPlan);
  const [habits, setHabits] = useLocalStorage<HabitReminder[]>('kaoyan.habits', initialHabits);
  const [memos, setMemos] = useLocalStorage<Memo[]>('kaoyan.memos', initialMemos);
  const [dailyTodos, setDailyTodos] = useLocalStorage<DailyTodo[]>('kaoyan.daily-todos', initialDailyTodos);
  const [dailyTodoTemplates, setDailyTodoTemplates] = useLocalStorage<DailyTodoTemplate[]>(
    'kaoyan.daily-todo-templates',
    initialDailyTodoTemplates,
  );
  const [dailyTodoCompletions, setDailyTodoCompletions] = useLocalStorage<DailyTodoCompletion[]>(
    'kaoyan.daily-todo-completions',
    initialDailyTodoCompletions,
  );
  const [longTermGoals, setLongTermGoals] = useLocalStorage<LongTermGoal[]>(
    'kaoyan.long-term-goals',
    initialLongTermGoals,
  );
  const [modulePreferences, setModulePreferences] = useLocalStorage<NavModulePreference[]>(
    'kaoyan.nav-modules',
    defaultModulePreferences,
  );
  const [rewardRecords, setRewardRecords] = useLocalStorage<RewardRecord[]>(
    'kaoyan.reward-records',
    initialRewardRecords,
  );
  const [weightProfile, setWeightProfile] = useLocalStorage<WeightProfile>(
    'kaoyan.weight-profile',
    initialWeightProfile,
  );
  const [weightEntries, setWeightEntries] = useLocalStorage<WeightEntry[]>(
    'kaoyan.weight-entries',
    initialWeightEntries,
  );
  const [lastOpenedDate, setLastOpenedDate] = useLocalStorage<string>('kaoyan.last-opened-date', todayISO());

  const normalizedModulePreferences = useMemo(
    () => normalizeModulePreferences(modulePreferences),
    [modulePreferences],
  );

  const visibleNavItems = useMemo(() => {
    const homeItem = navItems[0];
    const orderedVisibleItems = normalizedModulePreferences
      .filter((preference) => preference.visible)
      .map((preference) => navItems.find((item) => item.key === preference.key))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return [homeItem, ...orderedVisibleItems];
  }, [normalizedModulePreferences]);

  useEffect(() => {
    const today = todayISO();
    if (lastOpenedDate === today) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (!task.completed && task.autoRollOver && task.dueDate < today) {
          return {
            ...task,
            rolledFrom: task.rolledFrom ?? task.dueDate,
            dueDate: today,
          };
        }

        return task;
      }),
    );
    setLastOpenedDate(today);
  }, [lastOpenedDate, setLastOpenedDate, setTasks]);

  useEffect(() => {
    if (JSON.stringify(modulePreferences) !== JSON.stringify(normalizedModulePreferences)) {
      setModulePreferences(normalizedModulePreferences);
    }
  }, [modulePreferences, normalizedModulePreferences, setModulePreferences]);

  useEffect(() => {
    const activePageVisible = visibleNavItems.some((item) => item.key === activePage);

    if (!activePageVisible) {
      setActivePage('home');
    }
  }, [activePage, visibleNavItems]);

  useEffect(() => {
    if (!rewardFeedback) {
      return;
    }

    const timer = window.setTimeout(() => setRewardFeedback(null), 2400);
    return () => window.clearTimeout(timer);
  }, [rewardFeedback]);

  const triggerReward = (payload: { title: string; source: RewardRecord['source']; points?: number }) => {
    const now = new Date();
    const nextRecord: RewardRecord = {
      id: createId('reward'),
      title: payload.title,
      source: payload.source,
      points: payload.points ?? 10,
      createdAt: now.toISOString(),
      date: todayISO(),
      time: formatRewardTime(now),
    };

    setRewardRecords((currentRecords) => [nextRecord, ...currentRecords]);
    setRewardFeedback(nextRecord);
  };

  const toggleModuleVisibility = (key: ConfigurablePageKey) => {
    setModulePreferences((currentPreferences) =>
      normalizeModulePreferences(currentPreferences).map((preference) =>
        preference.key === key ? { ...preference, visible: !preference.visible } : preference,
      ),
    );
  };

  const moveModule = (key: ConfigurablePageKey, direction: 'up' | 'down') => {
    setModulePreferences((currentPreferences) => {
      const nextPreferences = normalizeModulePreferences(currentPreferences);
      const currentIndex = nextPreferences.findIndex((preference) => preference.key === key);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= nextPreferences.length) {
        return nextPreferences;
      }

      const movedPreference = nextPreferences[currentIndex];
      nextPreferences[currentIndex] = nextPreferences[targetIndex];
      nextPreferences[targetIndex] = movedPreference;

      return [...nextPreferences];
    });
  };

  const reminderCounts = useMemo(() => {
    const today = todayISO();
    const overdue = tasks.filter((task) => !task.completed && task.dueDate < today).length;
    const todayTasks = tasks.filter((task) => task.dueDate === today && !task.completed).length;
    return { overdue, todayTasks };
  }, [tasks]);

  return (
    <>
      <Layout
        navItems={visibleNavItems}
        moduleItems={moduleNavItems}
        modulePreferences={normalizedModulePreferences}
        activePage={activePage}
        onNavigate={setActivePage}
        onToggleModule={toggleModuleVisibility}
        onMoveModule={moveModule}
        reminderCounts={reminderCounts}
      >
      {activePage === 'home' && (
        <HomePage
          tasks={tasks}
          plan={plan}
          habits={habits}
          setTasks={setTasks}
          onReward={triggerReward}
          onNavigate={setActivePage}
        />
      )}
      {activePage === 'todos' && (
        <DailyTodosPage
          todos={dailyTodos}
          setTodos={setDailyTodos}
          templates={dailyTodoTemplates}
          setTemplates={setDailyTodoTemplates}
          completions={dailyTodoCompletions}
          setCompletions={setDailyTodoCompletions}
          onReward={triggerReward}
        />
      )}
      {activePage === 'goals' && (
        <LongTermGoalsPage goals={longTermGoals} setGoals={setLongTermGoals} onReward={triggerReward} />
      )}
      {activePage === 'rewards' && <RewardsPage records={rewardRecords} />}
      {activePage === 'plan' && <PlanPage plan={plan} setPlan={setPlan} setTasks={setTasks} />}
      {activePage === 'reminders' && (
        <RemindersPage
          tasks={tasks}
          habits={habits}
          setTasks={setTasks}
          setHabits={setHabits}
          onReward={triggerReward}
        />
      )}
      {activePage === 'memos' && <MemosPage memos={memos} setMemos={setMemos} setTasks={setTasks} />}
      {activePage === 'weight' && (
        <WeightPage
          profile={weightProfile}
          setProfile={setWeightProfile}
          entries={weightEntries}
          setEntries={setWeightEntries}
        />
      )}
      </Layout>
      {rewardFeedback && (
        <div
          className="fixed right-4 top-4 z-50 w-[min(360px,calc(100vw-32px))] rounded-lg border border-amber-100 bg-white p-4 shadow-xl"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">完成奖励 +{rewardFeedback.points}</p>
              <p className="mt-1 break-words text-sm leading-5 text-slate-600">{rewardFeedback.title}</p>
              <p className="mt-2 text-xs text-slate-500">{rewardFeedback.source} · 已记录到奖励中心</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
