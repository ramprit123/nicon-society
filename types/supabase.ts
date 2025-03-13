export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string
          username: string
          full_name: string
          avatar_url: string | null
          flat_number: string | null
        }
        Insert: {
          id: string
          updated_at?: string
          username: string
          full_name: string
          avatar_url?: string | null
          flat_number?: string | null
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          flat_number?: string | null
        }
      }
      maintenance_requests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          location: string
          status: 'pending' | 'in_progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          user_id: string
          assigned_to: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          location: string
          status: 'pending' | 'in_progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          user_id: string
          assigned_to?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          location?: string
          status?: 'pending' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          user_id?: string
          assigned_to?: string | null
          completed_at?: string | null
        }
      }
    }
  }
}