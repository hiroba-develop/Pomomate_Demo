import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  PomodoroSettings,
  TimerStatus,
  TimerType,
  PomodoroSession,
  PomodoroTask,
} from "../types";

// ポモドーロコンテキストの型定義
interface PomodoroContextType {
  // タイマー状態
  timerStatus: TimerStatus;
  timerType: TimerType;
  timeRemaining: number;
  completedPomodoros: number;
  currentSession: PomodoroSession | null;

  // 設定
  settings: PomodoroSettings;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;

  // タイマー操作
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;

  // タスク関連
  currentTask: PomodoroTask | null;
  setCurrentTask: (task: PomodoroTask | null) => void;

  // 統計情報
  todayPomodoros: number;
  todaySessions: PomodoroSession[];
}

// デフォルト設定
const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

// コンテキスト作成
const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined
);

// プロバイダーコンポーネント
export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  // 状態管理
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [timerType, setTimerType] = useState<TimerType>("work");
  const [timeRemaining, setTimeRemaining] = useState(
    DEFAULT_SETTINGS.workDuration * 60
  );
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentTask, setCurrentTask] = useState<PomodoroTask | null>(null);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(
    null
  );
  const [todaySessions, setTodaySessions] = useState<PomodoroSession[]>([]);
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    // ローカルストレージから設定を読み込む
    const savedSettings = localStorage.getItem("pomodoroSettings");
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });

  // タイマーのインターバルID
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // 設定の更新
  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...newSettings };
        localStorage.setItem(
          "pomodoroSettings",
          JSON.stringify(updatedSettings)
        );
        return updatedSettings;
      });
    },
    []
  );

  // 今日のポモドーロ数を計算
  const todayPomodoros = todaySessions.filter(
    (session) => session.type === "work" && session.completed
  ).length;

  // タイマー完了時の処理（前方宣言）
  const handleTimerComplete = useCallback(() => {}, []);

  // 通知を送信
  const sendNotification = useCallback(() => {
    // ブラウザ通知が許可されているか確認
    if (Notification.permission === "granted") {
      const title =
        timerType === "work"
          ? "作業時間が終了しました！"
          : "休憩時間が終了しました！";

      const body =
        timerType === "work" ? "休憩しましょう！" : "作業を再開しましょう！";

      new Notification(title, { body });
    }

    // 音声通知
    try {
      // ビープ音を鳴らす
      const context = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.5;

      oscillator.start();

      // 0.5秒後に停止
      setTimeout(() => {
        oscillator.stop();
      }, 500);
    } catch (err) {
      console.error("通知音の再生に失敗しました:", err);
    }
  }, [timerType]);

  // タイマーの開始
  const startTimer = useCallback(() => {
    if (timerStatus === "running") return;

    // 現在のセッションを作成
    const now = new Date().toISOString();
    const newSession: PomodoroSession = {
      id: `session-${Date.now()}`,
      taskId: currentTask?.id,
      startTime: now,
      endTime: "", // 終了時に設定
      type: timerType,
      completed: false,
    };

    setCurrentSession(newSession);
    setTimerStatus("running");

    // タイマーの開始
    const id = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // タイマー終了時の処理
          clearInterval(id);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setIntervalId(id);
  }, [timerStatus, timerType, currentTask, handleTimerComplete]);

  // タイマーの一時停止
  const pauseTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimerStatus("paused");
  }, [intervalId]);

  // タイマーの再開
  const resumeTimer = useCallback(() => {
    if (timerStatus !== "paused") return;
    startTimer();
  }, [timerStatus, startTimer]);

  // タイマーのリセット
  const resetTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // 現在のタイマータイプに応じた時間をセット
    if (timerType === "work") {
      setTimeRemaining(settings.workDuration * 60);
    } else if (timerType === "shortBreak") {
      setTimeRemaining(settings.shortBreakDuration * 60);
    } else {
      setTimeRemaining(settings.longBreakDuration * 60);
    }

    setTimerStatus("idle");
    setCurrentSession(null);
  }, [intervalId, timerType, settings]);

  // タイマーのスキップ
  const skipTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // 次のタイマータイプに移行
    handleTimerComplete();
  }, [intervalId, handleTimerComplete]);

  // タイマー完了時の処理（実装）
  Object.assign(handleTimerComplete, {
    current: () => {
      // 通知を送信
      sendNotification();

      // 現在のセッションを完了としてマーク
      if (currentSession) {
        const completedSession: PomodoroSession = {
          ...currentSession,
          endTime: new Date().toISOString(),
          completed: true,
        };

        // セッションを保存
        setTodaySessions((prev) => [...prev, completedSession]);

        // ローカルストレージに保存
        const today = new Date().toISOString().split("T")[0];
        const storedSessions = JSON.parse(
          localStorage.getItem(`sessions_${today}`) || "[]"
        );
        localStorage.setItem(
          `sessions_${today}`,
          JSON.stringify([...storedSessions, completedSession])
        );

        setCurrentSession(null);
      }

      // 作業セッションが完了した場合
      if (timerType === "work") {
        // ポモドーロ完了数をインクリメント
        setCompletedPomodoros((prev) => prev + 1);

        // 現在のタスクのポモドーロ数を更新
        if (currentTask) {
          const updatedTask = {
            ...currentTask,
            completedPomodoros: currentTask.completedPomodoros + 1,
            updatedAt: new Date().toISOString(),
          };
          setCurrentTask(updatedTask);

          // ローカルストレージのタスクも更新
          const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
          const updatedTasks = storedTasks.map((task: PomodoroTask) =>
            task.id === currentTask.id ? updatedTask : task
          );
          localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        }

        // 次のタイマータイプを決定
        if (
          completedPomodoros % settings.longBreakInterval ===
          settings.longBreakInterval - 1
        ) {
          setTimerType("longBreak");
          setTimeRemaining(settings.longBreakDuration * 60);
        } else {
          setTimerType("shortBreak");
          setTimeRemaining(settings.shortBreakDuration * 60);
        }
      } else {
        // 休憩が終わったら作業モードに戻る
        setTimerType("work");
        setTimeRemaining(settings.workDuration * 60);
      }

      setTimerStatus("finished");

      // 自動開始設定に応じてタイマーを開始
      if (
        (timerType === "work" && settings.autoStartBreaks) ||
        ((timerType === "shortBreak" || timerType === "longBreak") &&
          settings.autoStartPomodoros)
      ) {
        setTimeout(() => startTimer(), 1500); // 少し間を置いてから自動開始
      }
    },
  });

  // useCallbackの実装を更新
  useEffect(() => {
    (handleTimerComplete as any).current = () => {
      // 通知を送信
      sendNotification();

      // 現在のセッションを完了としてマーク
      if (currentSession) {
        const completedSession: PomodoroSession = {
          ...currentSession,
          endTime: new Date().toISOString(),
          completed: true,
        };

        // セッションを保存
        setTodaySessions((prev) => [...prev, completedSession]);

        // ローカルストレージに保存
        const today = new Date().toISOString().split("T")[0];
        const storedSessions = JSON.parse(
          localStorage.getItem(`sessions_${today}`) || "[]"
        );
        localStorage.setItem(
          `sessions_${today}`,
          JSON.stringify([...storedSessions, completedSession])
        );

        setCurrentSession(null);
      }

      // 作業セッションが完了した場合
      if (timerType === "work") {
        // ポモドーロ完了数をインクリメント
        setCompletedPomodoros((prev) => prev + 1);

        // 現在のタスクのポモドーロ数を更新
        if (currentTask) {
          const updatedTask = {
            ...currentTask,
            completedPomodoros: currentTask.completedPomodoros + 1,
            updatedAt: new Date().toISOString(),
          };
          setCurrentTask(updatedTask);

          // ローカルストレージのタスクも更新
          const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
          const updatedTasks = storedTasks.map((task: PomodoroTask) =>
            task.id === currentTask.id ? updatedTask : task
          );
          localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        }

        // 次のタイマータイプを決定
        if (
          completedPomodoros % settings.longBreakInterval ===
          settings.longBreakInterval - 1
        ) {
          setTimerType("longBreak");
          setTimeRemaining(settings.longBreakDuration * 60);
        } else {
          setTimerType("shortBreak");
          setTimeRemaining(settings.shortBreakDuration * 60);
        }
      } else {
        // 休憩が終わったら作業モードに戻る
        setTimerType("work");
        setTimeRemaining(settings.workDuration * 60);
      }

      setTimerStatus("finished");

      // 自動開始設定に応じてタイマーを開始
      if (
        (timerType === "work" && settings.autoStartBreaks) ||
        ((timerType === "shortBreak" || timerType === "longBreak") &&
          settings.autoStartPomodoros)
      ) {
        setTimeout(() => startTimer(), 1500); // 少し間を置いてから自動開始
      }
    };
  }, [
    timerType,
    currentSession,
    completedPomodoros,
    settings,
    currentTask,
    startTimer,
    sendNotification,
  ]);

  // 初期化時に今日のセッションをロード
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const storedSessions = JSON.parse(
      localStorage.getItem(`sessions_${today}`) || "[]"
    );
    setTodaySessions(storedSessions);

    // 完了したポモドーロ数を計算
    const completedCount = storedSessions.filter(
      (session: PomodoroSession) => session.type === "work" && session.completed
    ).length;
    setCompletedPomodoros(completedCount);

    // クリーンアップ
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // コンテキスト値
  const contextValue: PomodoroContextType = {
    timerStatus,
    timerType,
    timeRemaining,
    completedPomodoros,
    currentSession,
    settings,
    updateSettings,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    currentTask,
    setCurrentTask,
    todayPomodoros,
    todaySessions,
  };

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};

// カスタムフック
export const usePomodoro = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
};
