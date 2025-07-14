import { useState, useEffect } from "react";
import { usePomodoro } from "../contexts/PomodoroContext";
import type { PomodoroTask } from "../types";

// 新しいタスクの初期値
const initialNewTask = {
  title: "",
  description: "",
  estimatedPomodoros: 1,
  completedPomodoros: 0,
  isCompleted: false,
  priority: "medium" as "low" | "medium" | "high",
};

const TaskList: React.FC = () => {
  const { currentTask, setCurrentTask } = usePomodoro();
  const [tasks, setTasks] = useState<PomodoroTask[]>([]);
  const [newTask, setNewTask] = useState(initialNewTask);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // タスクをローカルストレージから読み込む
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(storedTasks);
  }, []);

  // タスクをローカルストレージに保存
  const saveTasks = (updatedTasks: PomodoroTask[]) => {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  // 新しいタスクを追加
  const handleAddTask = () => {
    if (newTask.title.trim() === "") return;

    const now = new Date().toISOString();
    const task: PomodoroTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const updatedTasks = [...tasks, task];
    saveTasks(updatedTasks);
    setNewTask(initialNewTask);
    setIsAddingTask(false);
  };

  // タスクの完了状態を切り替え
  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          isCompleted: !task.isCompleted,
          updatedAt: new Date().toISOString(),
        };

        // 現在のタスクが完了した場合、選択を解除
        if (currentTask?.id === taskId && updatedTask.isCompleted) {
          setCurrentTask(null);
        }

        return updatedTask;
      }
      return task;
    });

    saveTasks(updatedTasks);
  };

  // タスクを削除
  const deleteTask = (taskId: string) => {
    // 現在選択中のタスクが削除される場合、選択を解除
    if (currentTask?.id === taskId) {
      setCurrentTask(null);
    }

    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  // タスクを選択
  const selectTask = (task: PomodoroTask) => {
    if (task.isCompleted) return; // 完了済みタスクは選択できない
    setCurrentTask(task);
  };

  // フィルタリングされたタスク
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.isCompleted;
    if (filter === "completed") return task.isCompleted;
    return true;
  });

  // 優先度に応じたカラークラス
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-sub2 text-primary border-sub2";
      case "low":
        return "bg-blue-100 text-primary border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">タスク</h2>
        <button
          onClick={() => setIsAddingTask(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent"
        >
          タスクを追加
        </button>
      </div>

      {/* フィルターボタン */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-md ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-3 py-1 rounded-md ${
            filter === "active"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          進行中
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-3 py-1 rounded-md ${
            filter === "completed"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          完了済み
        </button>
      </div>

      {/* タスク追加フォーム */}
      {isAddingTask && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              タイトル
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="タスクのタイトル"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              説明
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="タスクの説明"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              予想ポモドーロ数
            </label>
            <input
              type="number"
              min="1"
              value={newTask.estimatedPomodoros}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  estimatedPomodoros: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              優先度
            </label>
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as "low" | "medium" | "high",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              キャンセル
            </button>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* タスクリスト */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">タスクがありません</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 border rounded-lg ${
                currentTask?.id === task.id
                  ? "border-accent bg-blue-50"
                  : "border-gray-200"
              } ${task.isCompleted ? "opacity-70" : ""}`}
              onClick={() => selectTask(task)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="h-5 w-5 text-accent focus:ring-accent border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <h3
                      className={`font-medium ${
                        task.isCompleted
                          ? "line-through text-gray-500"
                          : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority === "high"
                          ? "高"
                          : task.priority === "medium"
                          ? "中"
                          : "低"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.completedPomodoros} / {task.estimatedPomodoros}{" "}
                        ポモドーロ
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
