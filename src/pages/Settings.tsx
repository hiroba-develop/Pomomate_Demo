import { useState, useEffect } from "react";
import { PomodoroProvider, usePomodoro } from "../contexts/PomodoroContext";
import { useAuth } from "../contexts/AuthContext";
import type { DisplaySettings, PomodoroNotificationSettings } from "../types";

const SettingsContent = () => {
  const { settings, updateSettings } = usePomodoro();
  const { user, logout } = useAuth();

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    theme: "light",
    language: "ja",
  });

  const [notificationSettings, setNotificationSettings] =
    useState<PomodoroNotificationSettings>({
      soundEnabled: true,
      soundUrl: "/notification_melody.mp3",
      browserNotificationsEnabled: true,
    });

  // 設定をローカルストレージから読み込む
  useEffect(() => {
    const storedDisplaySettings = localStorage.getItem("displaySettings");
    if (storedDisplaySettings) {
      setDisplaySettings(JSON.parse(storedDisplaySettings));
    }

    const storedNotificationSettings = localStorage.getItem(
      "notificationSettings"
    );
    if (storedNotificationSettings) {
      setNotificationSettings(JSON.parse(storedNotificationSettings));
    }
  }, []);

  // ポモドーロ設定の更新
  const handlePomodoroSettingsChange = (
    field: keyof typeof settings,
    value: number | boolean
  ) => {
    updateSettings({ [field]: value });
  };

  // 表示設定の更新
  const handleDisplaySettingsChange = (
    field: keyof DisplaySettings,
    value: string
  ) => {
    const updatedSettings = { ...displaySettings, [field]: value };
    setDisplaySettings(updatedSettings);
    localStorage.setItem("displaySettings", JSON.stringify(updatedSettings));

    // テーマの適用
    if (field === "theme") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(value);
    }
  };

  // 通知設定の更新
  const handleNotificationSettingsChange = (
    field: keyof PomodoroNotificationSettings,
    value: boolean | string
  ) => {
    const updatedSettings = { ...notificationSettings, [field]: value };
    setNotificationSettings(updatedSettings);
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(updatedSettings)
    );

    // ブラウザ通知の許可を確認
    if (field === "browserNotificationsEnabled" && value === true) {
      Notification.requestPermission();
    }
  };

  // 通知音のテスト
  const testNotificationSound = () => {
    try {
      // notification_melody.mp3を再生する
      const audio = new Audio("/notification_melody.mp3");

      // 再生開始
      audio.play().catch((err) => {
        console.error("通知音の再生に失敗しました:", err);
      });

      // 5秒後に停止
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 5000);
    } catch (err) {
      console.error("通知音の再生に失敗しました:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* ポモドーロ設定 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">
            ポモドーロ設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">作業時間（分）</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.workDuration}
                onChange={(e) =>
                  handlePomodoroSettingsChange(
                    "workDuration",
                    parseInt(e.target.value) || 25
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                短い休憩時間（分）
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) =>
                  handlePomodoroSettingsChange(
                    "shortBreakDuration",
                    parseInt(e.target.value) || 5
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                長い休憩時間（分）
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) =>
                  handlePomodoroSettingsChange(
                    "longBreakDuration",
                    parseInt(e.target.value) || 15
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                長い休憩までのポモドーロ数
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.longBreakInterval}
                onChange={(e) =>
                  handlePomodoroSettingsChange(
                    "longBreakInterval",
                    parseInt(e.target.value) || 4
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoStartBreaks"
                checked={settings.autoStartBreaks}
                onChange={(e) =>
                  handlePomodoroSettingsChange(
                    "autoStartBreaks",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
              />
              <label htmlFor="autoStartBreaks" className="ml-2 text-gray-700">
                休憩を自動的に開始する
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoStartPomodoros"
                checked={settings.autoStartPomodoros}
                onChange={(e) =>
                  handlePomodoroSettingsChange(
                    "autoStartPomodoros",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
              />
              <label
                htmlFor="autoStartPomodoros"
                className="ml-2 text-gray-700"
              >
                ポモドーロを自動的に開始する
              </label>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">通知設定</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="soundEnabled"
                checked={notificationSettings.soundEnabled}
                onChange={(e) =>
                  handleNotificationSettingsChange(
                    "soundEnabled",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
              />
              <label htmlFor="soundEnabled" className="ml-2 text-gray-700">
                音声通知を有効にする
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="browserNotificationsEnabled"
                checked={notificationSettings.browserNotificationsEnabled}
                onChange={(e) =>
                  handleNotificationSettingsChange(
                    "browserNotificationsEnabled",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
              />
              <label
                htmlFor="browserNotificationsEnabled"
                className="ml-2 text-gray-700"
              >
                ブラウザ通知を有効にする
              </label>
            </div>

            <div>
              <button
                onClick={testNotificationSound}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent"
                disabled={!notificationSettings.soundEnabled}
              >
                通知音をテスト
              </button>
            </div>
          </div>
        </div>

        {/* 表示設定 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">表示設定</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">テーマ</label>
              <select
                value={displaySettings.theme}
                onChange={(e) =>
                  handleDisplaySettingsChange("theme", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
                <option value="system">システム設定に合わせる</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">言語</label>
              <select
                value={displaySettings.language}
                onChange={(e) =>
                  handleDisplaySettingsChange(
                    "language",
                    e.target.value as "ja" | "en"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* アカウント設定 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">
            アカウント設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">ユーザー名</label>
              <p className="text-gray-800">{user?.name}</p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">メールアドレス</label>
              <p className="text-gray-800">{user?.email}</p>
            </div>

            <div className="pt-4">
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  return (
    <PomodoroProvider>
      <SettingsContent />
    </PomodoroProvider>
  );
};

export default Settings;
