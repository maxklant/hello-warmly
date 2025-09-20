// Core User and Authentication Types
export interface User {
  name: string;
  email: string;
  phone?: string;
}

// Contact Management Types
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isMuted?: boolean;
  mutedUntil?: string; // ISO date string for temporary muting
}

// Check-in Related Types
export interface StatusOption {
  id: string;
  emoji: string;
  text: string;
  className: string;
}

export interface EmotionOption {
  id: string;
  emoji: string;
  text: string;
}

export interface CheckInData {
  status: string;
  mood: number;
  emotions: string[];
  todayActivities: string;
  currentActivity: string;
  visibility: string;
  timestamp: string;
}

// Chat and Messaging Types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  type: 'text' | 'check-in-reaction';
  checkInId?: string;
}

// Settings and Preferences Types
export type PrivacyLevel = "everyone" | "contacts" | "family";
export type CheckInFilter = "all" | "today" | "week" | "month";
export type ThemeMode = "light" | "dark" | "system";

// Navigation Types
export interface NavItem {
  to: string;
  icon: React.ComponentType;
  label: string;
}

// Component Props Types
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

// Utility Types
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

// Local Storage Keys (for type safety)
export const STORAGE_KEYS = {
  CHECK_IN_USER: "checkInUser",
  USER_CONTACTS: "userContacts",
  LAST_CHECK_IN: "lastCheckIn",
  LAST_CHECK_IN_DATA: "lastCheckInData",
  CHAT_MESSAGES: "chatMessages",
  DARK_MODE: "darkMode",
  CHECK_IN_FILTER: "checkInFilter",
  PRIVACY_SETTING: "privacySetting",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];