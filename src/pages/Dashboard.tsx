import { PomodoroProvider } from "../contexts/PomodoroContext";
import PomodoroTimer from "../components/PomodoroTimer";
import TaskList from "../components/TaskList";

const Dashboard = () => {
  return (
    <PomodoroProvider>
      <div className="container mx-auto px-2 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左側：ポモドーロタイマー */}
          <div className="lg:col-span-3">
            <PomodoroTimer />
          </div>

          {/* 右側：タスクリスト（カンバンボード） */}
          <div className="lg:col-span-9">
            <TaskList />
          </div>
        </div>
      </div>
    </PomodoroProvider>
  );
};

export default Dashboard;
