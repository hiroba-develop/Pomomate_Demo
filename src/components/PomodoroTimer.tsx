import { useState, useEffect } from "react";
import { usePomodoro } from "../contexts/PomodoroContext";

// 時間のフォーマット関数
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

// ポモドーロタイマーコンポーネント
const PomodoroTimer: React.FC = () => {
  const {
    timerStatus,
    timerType,
    timeRemaining,
    completedPomodoros,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    currentTask,
  } = usePomodoro();

  // 終了予定時刻の計算
  const [estimatedEndTime, setEstimatedEndTime] = useState<string>("");

  useEffect(() => {
    if (timerStatus === "running") {
      const endTime = new Date();
      endTime.setSeconds(endTime.getSeconds() + timeRemaining);
      setEstimatedEndTime(
        endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      setEstimatedEndTime("");
    }
  }, [timerStatus, timeRemaining]);

  // タイマータイプに応じたタイトルとカラー
  const getTimerInfo = () => {
    switch (timerType) {
      case "work":
        return {
          title: "作業時間",
          bgColor: "bg-primary",
          textColor: "text-primary",
          borderColor: "border-primary",
        };
      case "shortBreak":
        return {
          title: "短い休憩",
          bgColor: "bg-sub1",
          textColor: "text-sub1",
          borderColor: "border-sub1",
        };
      case "longBreak":
        return {
          title: "長い休憩",
          bgColor: "bg-accent",
          textColor: "text-accent",
          borderColor: "border-accent",
        };
      default:
        return {
          title: "作業時間",
          bgColor: "bg-primary",
          textColor: "text-primary",
          borderColor: "border-primary",
        };
    }
  };

  const timerInfo = getTimerInfo();

  // 進捗バーの計算
  const calculateProgress = () => {
    let totalTime;
    switch (timerType) {
      case "work":
        totalTime = settings.workDuration * 60;
        break;
      case "shortBreak":
        totalTime = settings.shortBreakDuration * 60;
        break;
      case "longBreak":
        totalTime = settings.longBreakDuration * 60;
        break;
      default:
        totalTime = settings.workDuration * 60;
    }

    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full">
      <div className="text-center mb-4 md:mb-6">
        <h2 className={`text-xl md:text-2xl font-bold ${timerInfo.textColor}`}>
          {timerInfo.title}
        </h2>
        {currentTask && (
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            現在のタスク: {currentTask.title}
          </p>
        )}
      </div>

      {/* タイマー表示 */}
      <div className="flex justify-center mb-4 md:mb-6">
        <div
          className={`relative w-36 h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full flex items-center justify-center border-6 md:border-8 ${timerInfo.borderColor}`}
        >
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold">
            {formatTime(timeRemaining)}
          </div>
          {/* 進捗バー */}
          <div
            className="absolute top-0 left-0 w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${
                timerInfo.bgColor
              } ${calculateProgress()}%, transparent ${calculateProgress()}%)`,
              opacity: 0.3,
            }}
          />
        </div>
      </div>

      {/* 操作ボタン */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 md:mb-6">
        {timerStatus === "idle" && (
          <button
            onClick={startTimer}
            className={`px-4 md:px-6 py-2 rounded-full text-white ${timerInfo.bgColor} hover:opacity-90`}
          >
            開始
          </button>
        )}

        {timerStatus === "running" && (
          <button
            onClick={pauseTimer}
            className="px-4 md:px-6 py-2 rounded-full text-white bg-sub2 text-primary font-bold hover:opacity-90"
          >
            一時停止
          </button>
        )}

        {timerStatus === "paused" && (
          <button
            onClick={resumeTimer}
            className={`px-4 md:px-6 py-2 rounded-full text-white ${timerInfo.bgColor} hover:opacity-90`}
          >
            再開
          </button>
        )}

        {timerStatus !== "idle" && (
          <button
            onClick={resetTimer}
            className="px-4 md:px-6 py-2 rounded-full text-white bg-red-500 hover:opacity-90"
          >
            リセット
          </button>
        )}

        <button
          onClick={skipTimer}
          className="px-4 md:px-6 py-2 rounded-full text-primary bg-gray-200 hover:bg-gray-300"
        >
          スキップ
        </button>
      </div>

      {/* 情報表示 */}
      <div className="text-center text-gray-600 text-sm md:text-base">
        <p>本日の完了ポモドーロ: {completedPomodoros}</p>
        {estimatedEndTime && (
          <p className="mt-1">終了予定時刻: {estimatedEndTime}</p>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
