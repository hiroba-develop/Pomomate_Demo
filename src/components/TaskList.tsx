import { useState, useEffect } from "react";
import { usePomodoro } from "../contexts/PomodoroContext";
import type { PomodoroTask } from "../types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

// 新しいタスクの初期値
const initialNewTask = {
  title: "",
  description: "",
  estimatedPomodoros: 1,
  completedPomodoros: 0,
  isCompleted: false,
  priority: "medium" as "low" | "medium" | "high",
  status: "todo" as "todo" | "inProgress" | "done",
};

const TaskList: React.FC = () => {
  const { currentTask, setCurrentTask } = usePomodoro();
  const [tasks, setTasks] = useState<PomodoroTask[]>([]);
  const [newTask, setNewTask] = useState(initialNewTask);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // センサーの設定（ドラッグアンドドロップ用）
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // タスクをローカルストレージから読み込む
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    // ステータスがない古いタスクに対してステータスを追加
    const updatedTasks = storedTasks.map((task: PomodoroTask) => {
      if (!task.status) {
        return {
          ...task,
          status: task.isCompleted ? "done" : "todo",
        };
      }
      return task;
    });

    // タスクが空の場合はデモデータを追加
    if (updatedTasks.length === 0) {
      const now = new Date().toISOString();
      const demoTasks: PomodoroTask[] = [
        {
          id: `task-demo-1`,
          title: "ポモドーロテクニックを学ぶ",
          description: "ポモドーロテクニックの基本原則と利点について調査する",
          estimatedPomodoros: 2,
          completedPomodoros: 2,
          isCompleted: true,
          priority: "high",
          status: "done",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: `task-demo-2`,
          title: "プロジェクト計画を作成",
          description: "次のスプリントのタスク優先順位付けと見積もり",
          estimatedPomodoros: 4,
          completedPomodoros: 2,
          isCompleted: false,
          priority: "high",
          status: "inProgress",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: `task-demo-3`,
          title: "週次レポートを作成",
          description: "先週の進捗状況と次週の目標をまとめる",
          estimatedPomodoros: 3,
          completedPomodoros: 0,
          isCompleted: false,
          priority: "medium",
          status: "todo",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: `task-demo-4`,
          title: "チームミーティングの準備",
          description: "アジェンダの作成と資料の準備",
          estimatedPomodoros: 2,
          completedPomodoros: 0,
          isCompleted: false,
          priority: "medium",
          status: "todo",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: `task-demo-5`,
          title: "新機能のリサーチ",
          description: "競合製品の分析と市場調査",
          estimatedPomodoros: 5,
          completedPomodoros: 0,
          isCompleted: false,
          priority: "low",
          status: "todo",
          createdAt: now,
          updatedAt: now,
        },
      ];

      updatedTasks.push(...demoTasks);
    }

    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
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
      isCompleted: false,
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
        const isCompleted = !task.isCompleted;
        const updatedTask = {
          ...task,
          isCompleted,
          status: isCompleted
            ? ("done" as const)
            : task.status === "done"
            ? ("inProgress" as const)
            : task.status,
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

  // ドラッグ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // タスクの順序を変更
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);

      // 移動先のタスクのステータスを取得
      const targetTask = tasks[newIndex];
      const sourceTask = tasks[oldIndex];

      // 同じステータス内での移動の場合は順序だけ変更
      if (sourceTask.status === targetTask.status) {
        const updatedTasks = arrayMove(tasks, oldIndex, newIndex);
        saveTasks(updatedTasks);
      } else {
        // 異なるステータスへの移動の場合はステータスも変更
        const updatedTasks = tasks.map((task) => {
          if (task.id === active.id) {
            return {
              ...task,
              status: targetTask.status,
              isCompleted: targetTask.status === "done",
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        });

        // 順序も変更
        const reorderedTasks = arrayMove(updatedTasks, oldIndex, newIndex);
        saveTasks(reorderedTasks);
      }
    }
  };

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

  // ステータスごとのタスクを取得
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "inProgress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">タスク</h2>
        <button
          onClick={() => setIsAddingTask(true)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors text-sm sm:text-base"
        >
          タスクを追加
        </button>
      </div>

      {/* タスク追加フォーム */}
      {isAddingTask && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                ステータス
              </label>
              <select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    status: e.target.value as "todo" | "inProgress" | "done",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="todo">未着手</option>
                <option value="inProgress">進行中</option>
                <option value="done">完了</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* カンバンボード */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
          {/* 未着手カラム */}
          <div className="bg-gray-100 rounded-lg p-2 sm:p-3 max-h-[500px] overflow-y-auto">
            <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-gray-700 flex items-center">
              <span className="w-2.5 h-2.5 bg-gray-500 rounded-full mr-1.5"></span>
              未着手
            </h3>
            <div className="space-y-2">
              <SortableContext
                items={todoTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {todoTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    タスクがありません
                  </p>
                ) : (
                  todoTasks.map((task) => (
                    <SortableItem key={task.id} id={task.id}>
                      <div
                        className={`p-2 sm:p-3 border bg-white rounded-lg shadow-sm transition-all hover:shadow ${
                          currentTask?.id === task.id
                            ? "border-accent bg-blue-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => selectTask(task)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <input
                              type="checkbox"
                              checked={task.isCompleted}
                              onChange={() => toggleTaskCompletion(task.id)}
                              className="h-4 w-4 sm:h-5 sm:w-5 text-accent focus:ring-accent border-gray-300 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <h3 className="font-medium text-gray-800 text-sm sm:text-base">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-2">
                                <span
                                  className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border ${getPriorityColor(
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
                                  {task.completedPomodoros} /{" "}
                                  {task.estimatedPomodoros} ポモドーロ
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 sm:h-5 sm:w-5"
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
                    </SortableItem>
                  ))
                )}
              </SortableContext>
            </div>
          </div>

          {/* 進行中カラム */}
          <div className="bg-blue-100 rounded-lg p-2 sm:p-3 max-h-[500px] overflow-y-auto">
            <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-gray-700 flex items-center">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-1.5"></span>
              進行中
            </h3>
            <div className="space-y-2">
              <SortableContext
                items={inProgressTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {inProgressTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    タスクがありません
                  </p>
                ) : (
                  inProgressTasks.map((task) => (
                    <SortableItem key={task.id} id={task.id}>
                      <div
                        className={`p-2 sm:p-3 border bg-white rounded-lg shadow-sm transition-all hover:shadow ${
                          currentTask?.id === task.id
                            ? "border-accent bg-blue-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => selectTask(task)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <input
                              type="checkbox"
                              checked={task.isCompleted}
                              onChange={() => toggleTaskCompletion(task.id)}
                              className="h-4 w-4 sm:h-5 sm:w-5 text-accent focus:ring-accent border-gray-300 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <h3 className="font-medium text-gray-800 text-sm sm:text-base">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-2">
                                <span
                                  className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border ${getPriorityColor(
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
                                  {task.completedPomodoros} /{" "}
                                  {task.estimatedPomodoros} ポモドーロ
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 sm:h-5 sm:w-5"
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
                    </SortableItem>
                  ))
                )}
              </SortableContext>
            </div>
          </div>

          {/* 完了カラム */}
          <div className="bg-green-100 rounded-lg p-2 sm:p-3 max-h-[500px] overflow-y-auto">
            <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-gray-700 flex items-center">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5"></span>
              完了
            </h3>
            <div className="space-y-2">
              <SortableContext
                items={doneTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {doneTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    タスクがありません
                  </p>
                ) : (
                  doneTasks.map((task) => (
                    <SortableItem key={task.id} id={task.id}>
                      <div
                        className={`p-2 sm:p-3 border bg-white rounded-lg shadow-sm opacity-70`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <input
                              type="checkbox"
                              checked={task.isCompleted}
                              onChange={() => toggleTaskCompletion(task.id)}
                              className="h-4 w-4 sm:h-5 sm:w-5 text-accent focus:ring-accent border-gray-300 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <h3 className="font-medium line-through text-gray-500 text-sm sm:text-base">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 line-through">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-2">
                                <span
                                  className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border opacity-60 ${getPriorityColor(
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
                                  {task.completedPomodoros} /{" "}
                                  {task.estimatedPomodoros} ポモドーロ
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 sm:h-5 sm:w-5"
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
                    </SortableItem>
                  ))
                )}
              </SortableContext>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default TaskList;
