import { PomodoroProvider } from "../contexts/PomodoroContext";
import PomodoroTimer from "../components/PomodoroTimer";
import TaskList from "../components/TaskList";

const Dashboard = () => {
  return (
    <PomodoroProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：ポモドーロタイマー */}
          <div>
            <PomodoroTimer />
          </div>

          {/* 右側：タスクリスト */}
          <div>
            <TaskList />
          </div>
        </div>
      </div>
    </PomodoroProvider>
  );
};

export default Dashboard;
