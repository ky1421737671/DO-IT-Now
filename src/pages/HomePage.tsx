import type { Dispatch, SetStateAction } from 'react';
import CountdownCard from '../components/CountdownCard';
import ReminderPanel from '../components/ReminderPanel';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import type { ExamPlan, HabitReminder, PageKey, StudyTask } from '../types';
import { todayISO, tomorrowISO } from '../utils/date';

interface HomePageProps {
  tasks: StudyTask[];
  plan: ExamPlan;
  habits: HabitReminder[];
  setTasks: Dispatch<SetStateAction<StudyTask[]>>;
  onNavigate: (page: PageKey) => void;
}

function HomePage({ tasks, plan, habits, setTasks, onNavigate }: HomePageProps) {
  const today = todayISO();
  const todayTasks = tasks
    .filter((task) => task.dueDate === today)
    .sort((a, b) => Number(a.completed) - Number(b.completed) || a.dueTime.localeCompare(b.dueTime));

  const addTask = (task: StudyTask) => {
    setTasks((currentTasks) => [task, ...currentTasks]);
  };

  const toggleTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  };

  const postponeTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, dueDate: tomorrowISO(), rolledFrom: task.rolledFrom ?? task.dueDate } : task,
      ),
    );
  };

  return (
    <div className="grid gap-5">
      <CountdownCard plan={plan} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <TaskList
            tasks={todayTasks}
            subjects={plan.subjects}
            emptyText="今天还没有任务，可以先安排一个最重要的小任务。"
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onPostponeTask={postponeTask}
          />
          <TaskForm subjects={plan.subjects} onAddTask={addTask} />
        </div>

        <ReminderPanel tasks={tasks} habits={habits} onOpenReminders={() => onNavigate('reminders')} />
      </div>
    </div>
  );
}

export default HomePage;
