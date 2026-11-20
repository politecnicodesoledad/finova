export type Role = "student" | "teacher";
export type TabId = "panel" | "arcade" | "market" | "courses" | "goals" | "ledger";
export type GameId = "arcade" | "market";
export type MiniCourseId = "mc1" | "mc2" | "mc3";
export type AvatarStyle = "valeria" | "sofia" | "camila" | "mariana";
export type TxType = "in" | "save" | "prize";

export interface CurrentUser {
  role: Role;
  id: string;
}

export interface Month {
  id: number;
  name: string;
  title: string;
  icon: string;
  rewardCoins: number;
  rewardXP: number;
  topic: string;
  desc: string;
}

export interface Question {
  id: string;
  monthId: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PodiumHistoryEntry {
  period: number;
  names: string[];
}

export interface Course {
  id: string;
  grade: string;
  section: string;
  name: string;
  code: string;
  unlockedMonths: number[];
  /** Current school period, 1 to 4. */
  period: number;
  /** Student ids chosen by the teacher for 1st, 2nd and 3rd place. */
  podium: string[];
  podiumHistory: PodiumHistoryEntry[];
}

export interface Goal {
  id: string;
  title: string;
  icon: string;
  target: number;
  saved: number;
  color: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TxType;
  date: string;
}

/** plays[game][monthId] = number of games started that month */
export type Plays = Partial<Record<GameId, Record<number, number>>>;

export interface Student {
  id: string;
  name: string;
  fullName: string;
  courseId: string;
  avatarStyle: AvatarStyle;
  coins: number;
  xp: number;
  /** Period points: reset to 0 when the teacher closes a period. */
  pp: number;
  completedMonths: number[];
  completedCourses: MiniCourseId[];
  challenges: { monthlyMission: boolean; minicourse: boolean; savingsDeposit: boolean };
  goals: Goal[];
  transactions: Transaction[];
  bestSpeedTime: number;
  highScoreArcade: number;
  mkBest?: number;
  plays: Plays;
}

export interface Prize {
  id: string;
  name: string;
  cost: number;
  slots: number;
}

export interface PrizeClaim {
  id: string;
  prizeId: string;
  studentId: string;
  courseId: string;
  period: number;
}

export interface Teacher {
  name: string;
  school: string;
}

export interface AppState {
  currentUser: CurrentUser | null;
  activeTab: TabId;
  courses: Course[];
  students: Student[];
  questions: Question[];
  teacher: Teacher;
  prizes: Prize[];
  claims: PrizeClaim[];
}

export type MonthTask = [label: string, done: boolean];

export interface NextTodo {
  tab: TabId;
  key: "mission" | "courses" | "arcade" | "market" | "prizes";
}
