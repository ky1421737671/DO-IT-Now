import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarCheck, ClipboardList, ListTodo, NotebookPen } from 'lucide-react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PlanPage from './pages/PlanPage';
import RemindersPage from './pages/RemindersPage';
import MemosPage from './pages/MemosPage';
import DailyTodosPage from './pages/DailyTodosPage';
import {
  initialDailyTodoCompletions,
  initialDailyTodos,
  initialHabits,
  initialMemos,
  initialPlan,
  initialTasks,
} from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DailyTodo, DailyTodoCompletion, ExamPlan, HabitReminder, Memo, PageKey, StudyTask } from './types';
import { todayISO } from './utils/date';

const navItems = [
  { key: 'home' as const, label: '首页', icon: ClipboardList },
  { key: 'todos' as const, label: '每日待办', icon: ListTodo },
  { key: 'plan' as const, label: '考研计划', icon: CalendarCheck },
  { key: 'reminders' as const, label: '提醒', icon: Bell },
  { key: 'memos' as const, label: '备忘', icon: NotebookPen },
];

function App() {
  const [activePage, setActivePage] = useState<PageKey>('home');
  const [tasks, setTasks] = useLocalStorage<StudyTask[]>('kaoyan.tasks', initialTasks);
  const [plan, setPlan] = useLocalStorage<ExamPlan>('kaoyan.plan', initialPlan);
  const [habits, setHabits] = useLocalStorage<HabitReminder[]>('kaoyan.habits', initialHabits);
  const [memos, setMemos] = useLocalStorage<Memo[]>('kaoyan.memos', initialMemos);
  const [dailyTodos, setDailyTodos] = useLocalStorage<DailyTodo[]>('kaoyan.daily-todos', initialDailyTodos);
  const [dailyTodoCompletions, setDailyTodoCompletions] = useLocalStorage<DailyTodoCompletion[]>(
    'kaoyan.daily-todo-completions',
    initialDailyTodoCompletions,
  );
  const [lastOpenedDate, setLastOpenedDate] = useLocalStorage<string>('kaoyan.last-opened-date', todayISO());

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

  const reminderCounts = useMemo(() => {
    const today = todayISO();
    const overdue = tasks.filter((task) => !task.completed && task.dueDate < today).length;
    const todayTasks = tasks.filter((task) => task.dueDate === today && !task.completed).length;
    return { overdue, todayTasks };
  }, [tasks]);

  return (
    <Layout
      navItems={navItems}
      activePage={activePage}
      onNavigate={setActivePage}
      reminderCounts={reminderCounts}
    >
      {activePage === 'home' && (
        <HomePage
          tasks={tasks}
          plan={plan}
          habits={habits}
          setTasks={setTasks}
          onNavigate={setActivePage}
        />
      )}
      {activePage === 'todos' && (
        <DailyTodosPage
          todos={dailyTodos}
          setTodos={setDailyTodos}
          completions={dailyTodoCompletions}
          setCompletions={setDailyTodoCompletions}
        />
      )}
      {activePage === 'plan' && <PlanPage plan={plan} setPlan={setPlan} setTasks={setTasks} />}
      {activePage === 'reminders' && (
        <RemindersPage tasks={tasks} habits={habits} setTasks={setTasks} setHabits={setHabits} />
      )}
      {activePage === 'memos' && <MemosPage memos={memos} setMemos={setMemos} setTasks={setTasks} />}
    </Layout>
  );
}

export default App;
