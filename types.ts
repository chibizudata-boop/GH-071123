
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskCategory {
  MEAL = 'MEAL',
  MEDICATION = 'MEDICATION',
  HYGIENE = 'HYGIENE',
  ACTIVITY = 'ACTIVITY',
  ADMIN = 'ADMIN',
  OTHER = 'OTHER'
}

export interface StoredFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'excel' | 'pdf' | 'other';
  url: string; // Base64 or dummy URL
  date: string;
  albumId?: string; // Optional: belongs to an album
  description?: string; // Caption/Notes
  rotation?: number; // 0, 90, 180, 270 for simple editing
}

export interface Album {
  id: string;
  title: string;
  residentId: string;
  createdAt: string;
}

export interface Resident {
  id: string;
  name: string;
  roomNumber: string; // 101, 102, etc.
  age: number;
  birthDate?: string; // YYYY-MM-DD
  bloodType?: string; // A, B, O, AB
  diagnosis?: string; // 障害名
  currentWeight?: number; // kg
  disabilityLevel: string; // 障害支援区分
  assessment: string; // アセスメント・特性（AIのコンテキストに使用）
  carePlan: string; // 個別支援計画の概要
  avatarColor: string;
  files: StoredFile[]; // 関連ファイル（写真、PDF、Excel等）
  albums: Album[];
  belongings?: Belonging[];
  healthRecords?: HealthRecord[];
}

export interface Task {
  id: string;
  time: string; // HH:mm format
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  isCompleted: boolean;
  imageUrl?: string; // Base64 or URL
  assignedTo?: string;
  completedAt?: string;
  aiGeneratedInstructions?: string;
  residentId?: string; // どの利用者向けか
}

export interface Todo {
  id: string;
  content: string;
  isCompleted: boolean;
  staffId: string; // Link to specific staff
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: 'manager' | 'staff' | 'nurse';
  loginId?: string; // For display in admin
}

export interface User {
  id: string;
  name: string;
  role: 'manager' | 'staff' | 'nurse';
  isAuthenticated: boolean;
}

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  dayStaffId?: string; // 9:00-17:00
  nightStaffId?: string; // 17:00-9:00
}

export interface ResidentSchedule {
  id: string;
  residentId: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g., "生活介護", "通院", "帰宅"
  type: 'DAY_CARE' | 'VISIT' | 'HOME' | 'OTHER'; // 生活介護, 通院/訪問, 帰宅, その他
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'daily' | 'medical' | 'food' | 'other'; // 日用品, 医療, 食品, その他
  quantity: number;
  unit: string; // 個, 箱, 袋 etc.
  threshold: number; // 発注点
  ownerType: 'COMPANY' | 'RESIDENT'; // 会社備品か、利用者個別か
  residentId?: string; // 利用者個別の場合のID
  isOrderRequested?: boolean; // 発注依頼済みかどうか
  imageUrl?: string; // 写真
}

export interface Belonging {
  id: string;
  name: string;
  description?: string;
  photoUrl?: string;
  registeredDate: string;
}

export interface HealthRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  weight?: number; // kg
  temperature?: number; // ℃
  systolicBP?: number; // mmHg
  diastolicBP?: number; // mmHg
  pulse?: number; // bpm
  spo2?: number; // %
  respiration?: number; // 回/分
  mealIntake?: number; // % (0-100)
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'MEETING' | 'TRAINING' | 'EVENT' | 'OTHER';
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  isMedical?: boolean;
}

// Map & Facility Types
export interface Furniture {
  id: string;
  name: string; // e.g., Bed, TV, Shelf
  description?: string;
}

export interface Room {
  id: string;
  name: string; // e.g., "個室1", "食堂"
  type: 'PRIVATE' | 'SHARED' | 'OFFICE' | 'BATH' | 'TOILET' | 'STORAGE' | 'ENTRANCE' | 'CORRIDOR';
  residentId?: string; // If private room
  furniture: Furniture[];
  // Coordinates for the map (percentage based)
  x: number;
  y: number;
  width: number;
  height: number;
}

// Incident Report Types
export type ReportType = 'HIYARI' | 'ACCIDENT';

export interface IncidentReport {
  id: string;
  type: ReportType;
  createdAt: string;
  authorId: string;
  authorName: string;
  readByStaffIds: string[]; // List of staff IDs who have read this
  
  // 5W1H
  when: string; // Date/Time of incident
  where: string; // Place
  who: string; // Person involved (Resident name or 'Staff')
  what: string; // What happened
  why: string; // Cause
  how: string; // Response/Solution
  
  images?: string[]; // Attached photos
}

export interface CompanyResource {
  id: string;
  title: string;
  category: 'PHILOSOPHY' | 'MANUAL_CARE' | 'MANUAL_ADMIN';
  content: string; // Markdown supported
  lastUpdated: string;
  files?: StoredFile[]; // Attachments
}