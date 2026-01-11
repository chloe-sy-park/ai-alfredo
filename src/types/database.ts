// Supabase Database 타입 정의
// 실제 스키마와 동기화 필요

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ENUM 타입들
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'deferred' | 'cancelled';
export type TaskCategory = 'inbox' | 'work' | 'personal' | 'health' | 'social' | 'finance' | 'learning';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type HabitCategory = 'health' | 'productivity' | 'mindfulness' | 'social' | 'learning' | 'other';
export type ConditionLevel = 1 | 2 | 3 | 4 | 5;
export type FocusMode = 'pomodoro' | 'flow' | 'body_double' | 'deep_work';
export type BreakType = 'short' | 'long' | 'pause';
export type PenguinMood = 'happy' | 'neutral' | 'tired' | 'sad' | 'excited';
export type ItemCategory = 'hat' | 'accessory' | 'background' | 'outfit' | 'effect';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type SubscriptionPlan = 'free' | 'plus' | 'pro';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          google_id: string | null;
          email: string;
          name: string;
          avatar_url: string | null;
          google_access_token: string | null;
          google_refresh_token: string | null;
          is_onboarded: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          tone_preset: string;
          tone_warmth: number;
          tone_humor: number;
          tone_directness: number;
          tone_formality: number;
          tone_encouragement: number;
          privacy_level: string;
          notification_enabled: boolean;
          notification_morning: string | null;
          notification_evening: string | null;
          priority_weights: Json;
          chronotype: string | null;
          work_hours_start: string | null;
          work_hours_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          category: TaskCategory;
          priority: PriorityLevel;
          due_date: string | null;
          due_time: string | null;
          estimated_minutes: number | null;
          actual_minutes: number | null;
          is_top3: boolean;
          defer_count: number;
          tags: string[];
          repeat_type: RepeatType;
          repeat_config: Json | null;
          parent_task_id: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: HabitCategory;
          frequency: HabitFrequency;
          target_days: string[];
          reminder_time: string | null;
          current_streak: number;
          best_streak: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['habits']['Insert']>;
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          logged_at: string;
          completed: boolean;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['habit_logs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['habit_logs']['Insert']>;
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: FocusMode;
          task_id: string | null;
          task_title: string | null;
          planned_duration: number;
          actual_duration: number | null;
          started_at: string;
          ended_at: string | null;
          completed: boolean;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['focus_sessions']['Row'], 'id' | 'started_at'>;
        Update: Partial<Database['public']['Tables']['focus_sessions']['Insert']>;
      };
      daily_conditions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          energy_level: ConditionLevel;
          mood: ConditionLevel;
          focus_level: ConditionLevel;
          sleep_quality: ConditionLevel | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_conditions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_conditions']['Insert']>;
      };
      penguin_status: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          level: number;
          current_xp: number;
          xp_for_next_level: number;
          coins: number;
          happiness: number;
          mood: PenguinMood;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['penguin_status']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['penguin_status']['Insert']>;
      };
      penguin_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: ItemCategory;
          rarity: ItemRarity;
          price: number;
          required_level: number;
          image_url: string | null;
          is_available: boolean;
        };
        Insert: Omit<Database['public']['Tables']['penguin_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['penguin_items']['Insert']>;
      };
      penguin_inventory: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          acquired_at: string;
          is_equipped: boolean;
        };
        Insert: Omit<Database['public']['Tables']['penguin_inventory']['Row'], 'id' | 'acquired_at'>;
        Update: Partial<Database['public']['Tables']['penguin_inventory']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
    };
  };
}

// 편의를 위한 타입 별칭
export type User = Database['public']['Tables']['users']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type FocusSession = Database['public']['Tables']['focus_sessions']['Row'];
export type DailyCondition = Database['public']['Tables']['daily_conditions']['Row'];
export type PenguinStatus = Database['public']['Tables']['penguin_status']['Row'];
export type PenguinItem = Database['public']['Tables']['penguin_items']['Row'];
export type PenguinInventory = Database['public']['Tables']['penguin_inventory']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
