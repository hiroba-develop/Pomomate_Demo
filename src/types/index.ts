// 財務データ関連の型定義
export interface FinancialData {
  month: string;
  year: number;
  revenue: number;
  profit: number;
  expenses: number;
  customers: number;
}

// KPI関連の型定義
export interface KPIData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  color: string;
  status: "success" | "warning" | "error" | "info";
}

// ロードマップ関連の型定義
export interface YearlyTarget {
  year: number;
  netWorth: number; // 純資産
  revenue: number; // 売上
  profit: number; // 事業の利益
  employees: number;
  phase: BusinessPhase;
}

export type BusinessPhase = "創業期" | "成長期" | "拡大期" | "安定期";

// 通知・タスク関連の型定義
export interface Task {
  id: number;
  name: string;
  day: number;
  enabled: boolean;
  completed?: boolean; // タスクの完了状態を追加
  type: TaskType;
}

export type TaskType = "revenue" | "expense" | "analysis" | "report" | "custom";

// 相談・サポート関連の型定義
export interface Consultation {
  id: number;
  date: string;
  advisor: string;
  topic: string;
  status: ConsultationStatus;
  notes?: string;
}

export type ConsultationStatus = "予約済み" | "完了" | "キャンセル";

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

// ユーザー関連の型定義
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  createdAt: Date;
  lastLogin: Date;
}

// ユーザー関連の型定義
export interface User {
  id: string;
  name: string;
  email: string;
  isSetupComplete: boolean;
}

// ポモドーロ設定の型定義
export interface PomodoroSettings {
  workDuration: number; // 作業時間（分）
  shortBreakDuration: number; // 短い休憩時間（分）
  longBreakDuration: number; // 長い休憩時間（分）
  longBreakInterval: number; // 長い休憩までのポモドーロ数
  autoStartBreaks: boolean; // 休憩を自動的に開始するか
  autoStartPomodoros: boolean; // ポモドーロを自動的に開始するか
}

// タイマーの状態を表す型定義
export type TimerStatus = "idle" | "running" | "paused" | "finished";
export type TimerType = "work" | "shortBreak" | "longBreak";

// タスクの型定義
export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  category?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

// ポモドーロ用のタスク型定義
export interface PomodoroTask {
  id: string;
  title: string;
  description?: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  category?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  status: "todo" | "inProgress" | "done"; // カンバンボード用のステータス
}

// ポモドーロセッションの型定義
export interface PomodoroSession {
  id: string;
  taskId?: string;
  startTime: string;
  endTime: string;
  type: TimerType;
  completed: boolean;
}

// バッジの型定義
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  earnedAt?: string;
}

// 通知設定の型定義
export interface NotificationSettings {
  soundEnabled: boolean;
  soundUrl: string;
  browserNotificationsEnabled: boolean;
}

// ポモドーロ用の通知設定型定義
export interface PomodoroNotificationSettings {
  soundEnabled: boolean;
  soundUrl: string;
  browserNotificationsEnabled: boolean;
}

// 表示設定の型定義
export interface DisplaySettings {
  theme: "light" | "dark" | "system";
  language: "ja" | "en";
}

// カレンダービューの型定義
export type CalendarView = "month" | "week" | "day";

// ポイントシステムの型定義
export interface PointsData {
  total: number;
  today: number;
  streak: number;
}

// 設定関連の型定義
export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  mobile: boolean;
  frequency: "immediate" | "daily" | "weekly";
}

export interface YayoiSettings {
  connected: boolean;
  apiKey: string;
  autoSync: boolean;
  syncFrequency: "hourly" | "daily" | "weekly";
  lastSync?: Date;
}

// APIレスポンス関連の型定義
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// チャート関連の型定義
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData extends ChartData {
  date: string;
  target?: number;
  actual?: number;
}

// アラート関連の型定義
export interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
}

export type AlertType =
  | "target_miss"
  | "revenue_drop"
  | "expense_increase"
  | "system"
  | "reminder";
export type AlertSeverity = "low" | "medium" | "high" | "critical";

// 認証関連の型定義
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isSetupComplete: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

// 初期設定関連の型定義
export interface InitialSetup {
  userName: string; // ユーザー名を追加
  companyName: string; // 会社名（必須に変更）
  phoneNumber: string; // 電話番号を追加
  currentAssets: number;
  companySize: CompanySize;
  fiscalYearStartMonth: number;
  fiscalYearStartYear: number; // 事業年度開始年を追加
  industry: Industry;
  businessExperience: BusinessExperience;
  financialKnowledge: FinancialKnowledge;
  priorityGoals: PriorityGoal[];
  longTermGoal: LongTermGoal;
}

export type CompanySize =
  | "個人事業主"
  | "法人（従業員1-5名）"
  | "法人（従業員6-20名）"
  | "法人（従業員21名以上）";

export type Industry =
  | "IT・ソフトウェア"
  | "製造業"
  | "小売業"
  | "飲食業"
  | "サービス業"
  | "建設業"
  | "医療・福祉"
  | "教育"
  | "金融・保険"
  | "不動産"
  | "その他";

export type BusinessExperience =
  | "1年未満"
  | "1-3年"
  | "3-5年"
  | "5-10年"
  | "10年以上";

export type FinancialKnowledge =
  | "初心者"
  | "基本レベル"
  | "中級レベル"
  | "上級レベル";

export type PriorityGoal =
  | "売上向上"
  | "利益改善"
  | "コスト削減"
  | "キャッシュフロー改善"
  | "投資計画"
  | "税務対策"
  | "資金調達"
  | "事業拡大";

export interface LongTermGoal {
  targetYear: number;
  targetNetWorth: number; // 目標純資産
  description?: string;
}

// 設定ステップ関連
export interface SetupStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

// ランキング・表彰システム関連の型定義
export interface RankingSettings {
  isParticipating: boolean; // ランキング参加の可否
  isAnonymous: boolean; // 匿名表示の可否
  allowBenchmarking: boolean; // ベンチマーキング参加
  notificationEnabled: boolean; // ランキング通知の有効/無効
}

export interface CompanyRanking {
  id: string;
  rank: number;
  companyName?: string; // 匿名の場合は"A社"など
  isAnonymous: boolean;
  industry: Industry;
  companySize: CompanySize;
  foundingYear: number; // 創業年
  totalScore: number;
  netWorthFormationRate: number; // 純資産形成率
  revenueGrowthRate: number; // 売上成長率
  profitMarginImprovement: number; // 利益率改善
  targetAchievementRate: number; // 目標達成率
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  iconUrl?: string;
  unlockedAt?: Date;
}

export type BadgeCategory =
  | "performance" // パフォーマンスバッジ
  | "achievement" // 達成バッジ
  | "rare" // レアバッジ
  | "special"; // 特別賞

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Award {
  id: string;
  name: string;
  category: AwardCategory;
  period: AwardPeriod;
  year: number;
  month?: number; // 月次表彰の場合
  quarter?: number; // 四半期表彰の場合
  rank: number; // 1位、2位、3位
  companyId: string;
  companyName?: string; // 匿名の場合は表示されない
  isAnonymous: boolean;
}

export type AwardCategory =
  | "overall" // 総合
  | "industry" // 業界別
  | "size" // 規模別
  | "growth" // 成長率
  | "profit" // 利益率
  | "stability" // 安定経営
  | "special"; // 特別賞

export type AwardPeriod = "monthly" | "quarterly" | "annual";

export interface RankingCategory {
  id: string;
  name: string;
  description: string;
  type: RankingType;
}

export type RankingType =
  | "overall" // 総合ランキング
  | "industry" // 業界別
  | "size" // 規模別
  | "founding" // 創業年数別
  | "revenue" // 売上成長率
  | "profit" // 利益率改善
  | "net_worth" // 純資産形成率
  | "target"; // 目標達成率

export interface BenchmarkData {
  industry: Industry;
  companySize: CompanySize;
  averageScore: number;
  medianScore: number;
  topPercentileScore: number; // 上位10%の平均
  averageRevenueGrowth: number;
  averageProfitMargin: number;
  averageNetWorthFormation: number;
  averageTargetAchievement: number;
  participantCount: number;
}

export interface UserRankingData {
  currentRank: number;
  totalParticipants: number;
  totalScore: number;
  scoreBreakdown: {
    netWorthFormationRate: number;
    revenueGrowthRate: number;
    profitMarginImprovement: number;
    targetAchievementRate: number;
  };
  categoryRankings: {
    category: RankingType;
    rank: number;
    totalParticipants: number;
  }[];
  earnedBadges: Badge[];
  recentAwards: Award[];
  benchmarkData: BenchmarkData;
}
