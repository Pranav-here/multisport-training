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
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sports: {
        Row: {
          id: number
          slug: string
          name: string
        }
        Insert: {
          id?: number
          slug: string
          name: string
        }
        Update: {
          id?: number
          slug?: string
          name?: string
        }
        Relationships: []
      }
      user_sports: {
        Row: {
          user_id: string
          sport_id: number
          skill_level: string | null
          goals: string | null
          created_at: string | null
        }
        Insert: {
          user_id: string
          sport_id: number
          skill_level?: string | null
          goals?: string | null
          created_at?: string | null
        }
        Update: {
          user_id?: string
          sport_id?: number
          skill_level?: string | null
          goals?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_sports_sport_id_fkey'
            columns: ['sport_id']
            referencedRelation: 'sports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_sports_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      clips: {
        Row: {
          id: string
          user_id: string
          sport_id: number | null
          storage_path: string
          thumbnail_url: string | null
          caption: string | null
          visibility: Database['public']['Enums']['visibility_enum']
          duration_seconds: number | null
          width: number | null
          height: number | null
          created_at: string | null
          location: string | null
          tags: string[]
          drill_id: string | null
          share_count: number
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          sport_id?: number | null
          storage_path: string
          thumbnail_url?: string | null
          caption?: string | null
          visibility?: Database['public']['Enums']['visibility_enum']
          duration_seconds?: number | null
          width?: number | null
          height?: number | null
          created_at?: string | null
          location?: string | null
          tags?: string[]
          drill_id?: string | null
          share_count?: number
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          sport_id?: number | null
          storage_path?: string
          thumbnail_url?: string | null
          caption?: string | null
          visibility?: Database['public']['Enums']['visibility_enum']
          duration_seconds?: number | null
          width?: number | null
          height?: number | null
          created_at?: string | null
          location?: string | null
          tags?: string[]
          drill_id?: string | null
          share_count?: number
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'clips_drill_id_fkey'
            columns: ['drill_id']
            referencedRelation: 'drills'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'clips_sport_id_fkey'
            columns: ['sport_id']
            referencedRelation: 'sports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'clips_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      clip_likes: {
        Row: {
          user_id: string
          clip_id: string
          created_at: string | null
        }
        Insert: {
          user_id: string
          clip_id: string
          created_at?: string | null
        }
        Update: {
          user_id?: string
          clip_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clip_likes_clip_id_fkey'
            columns: ['clip_id']
            referencedRelation: 'clips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'clip_likes_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      clip_comments: {
        Row: {
          id: string
          clip_id: string
          user_id: string
          body: string
          created_at: string | null
        }
        Insert: {
          id?: string
          clip_id: string
          user_id: string
          body: string
          created_at?: string | null
        }
        Update: {
          id?: string
          clip_id?: string
          user_id?: string
          body?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clip_comments_clip_id_fkey'
            columns: ['clip_id']
            referencedRelation: 'clips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'clip_comments_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      clip_saves: {
        Row: {
          user_id: string
          clip_id: string
          created_at: string | null
        }
        Insert: {
          user_id: string
          clip_id: string
          created_at?: string | null
        }
        Update: {
          user_id?: string
          clip_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clip_saves_clip_id_fkey'
            columns: ['clip_id']
            referencedRelation: 'clips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'clip_saves_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      clip_shares: {
        Row: {
          id: string
          clip_id: string
          user_id: string
          shared_to: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          clip_id: string
          user_id: string
          shared_to?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          clip_id?: string
          user_id?: string
          shared_to?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clip_shares_clip_id_fkey'
            columns: ['clip_id']
            referencedRelation: 'clips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'clip_shares_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      drills: {
        Row: {
          id: string
          slug: string
          title: string
          sport_id: number
          difficulty: Database['public']['Enums']['drill_difficulty_enum']
          duration_minutes: number | null
          equipment: string[]
          description: string | null
          steps: string[]
          video_url: string | null
          thumbnail_url: string | null
          coaching_cues: string[]
          safety_tips: string[]
          target_skills: string[]
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          sport_id: number
          difficulty?: Database['public']['Enums']['drill_difficulty_enum']
          duration_minutes?: number | null
          equipment?: string[]
          description?: string | null
          steps?: string[]
          video_url?: string | null
          thumbnail_url?: string | null
          coaching_cues?: string[]
          safety_tips?: string[]
          target_skills?: string[]
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          sport_id?: number
          difficulty?: Database['public']['Enums']['drill_difficulty_enum']
          duration_minutes?: number | null
          equipment?: string[]
          description?: string | null
          steps?: string[]
          video_url?: string | null
          thumbnail_url?: string | null
          coaching_cues?: string[]
          safety_tips?: string[]
          target_skills?: string[]
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'drills_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'drills_sport_id_fkey'
            columns: ['sport_id']
            referencedRelation: 'sports'
            referencedColumns: ['id']
          }
        ]
      }
      drill_attempts: {
        Row: {
          id: string
          drill_id: string
          user_id: string
          performed_at: string | null
          reps: number | null
          sets: number | null
          distance: string | null
          accuracy: string | null
          duration_seconds: number | null
          score: string | null
          notes: string | null
          video_storage_path: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          drill_id: string
          user_id: string
          performed_at?: string | null
          reps?: number | null
          sets?: number | null
          distance?: string | null
          accuracy?: string | null
          duration_seconds?: number | null
          score?: string | null
          notes?: string | null
          video_storage_path?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          drill_id?: string
          user_id?: string
          performed_at?: string | null
          reps?: number | null
          sets?: number | null
          distance?: string | null
          accuracy?: string | null
          duration_seconds?: number | null
          score?: string | null
          notes?: string | null
          video_storage_path?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'drill_attempts_drill_id_fkey'
            columns: ['drill_id']
            referencedRelation: 'drills'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'drill_attempts_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      follows: {
        Row: {
          follower_id: string
          followee_id: string
          created_at: string | null
        }
        Insert: {
          follower_id: string
          followee_id: string
          created_at?: string | null
        }
        Update: {
          follower_id?: string
          followee_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'follows_followee_id_fkey'
            columns: ['followee_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      achievements: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          type: Database['public']['Enums']['achievement_type_enum']
          sport_id: number | null
          points: number
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          type?: Database['public']['Enums']['achievement_type_enum']
          sport_id?: number | null
          points?: number
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          type?: Database['public']['Enums']['achievement_type_enum']
          sport_id?: number | null
          points?: number
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'achievements_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'achievements_sport_id_fkey'
            columns: ['sport_id']
            referencedRelation: 'sports'
            referencedColumns: ['id']
          }
        ]
      }
      user_achievements: {
        Row: {
          user_id: string
          achievement_id: string
          earned_at: string | null
          metadata: Json | null
        }
        Insert: {
          user_id: string
          achievement_id: string
          earned_at?: string | null
          metadata?: Json | null
        }
        Update: {
          user_id?: string
          achievement_id?: string
          earned_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_achievements_achievement_id_fkey'
            columns: ['achievement_id']
            referencedRelation: 'achievements'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_achievements_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      daily_challenges: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          sport_id: number | null
          difficulty: Database['public']['Enums']['challenge_difficulty_enum']
          points: number
          thumbnail_url: string | null
          starts_at: string
          ends_at: string | null
          status: Database['public']['Enums']['challenge_status_enum']
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          sport_id?: number | null
          difficulty?: Database['public']['Enums']['challenge_difficulty_enum']
          points?: number
          thumbnail_url?: string | null
          starts_at: string
          ends_at?: string | null
          status?: Database['public']['Enums']['challenge_status_enum']
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          sport_id?: number | null
          difficulty?: Database['public']['Enums']['challenge_difficulty_enum']
          points?: number
          thumbnail_url?: string | null
          starts_at?: string
          ends_at?: string | null
          status?: Database['public']['Enums']['challenge_status_enum']
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'daily_challenges_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'daily_challenges_sport_id_fkey'
            columns: ['sport_id']
            referencedRelation: 'sports'
            referencedColumns: ['id']
          }
        ]
      }
      user_challenge_entries: {
        Row: {
          challenge_id: string
          user_id: string
          status: Database['public']['Enums']['challenge_entry_status_enum']
          joined_at: string | null
          completed_at: string | null
          progress: Json | null
        }
        Insert: {
          challenge_id: string
          user_id: string
          status?: Database['public']['Enums']['challenge_entry_status_enum']
          joined_at?: string | null
          completed_at?: string | null
          progress?: Json | null
        }
        Update: {
          challenge_id?: string
          user_id?: string
          status?: Database['public']['Enums']['challenge_entry_status_enum']
          joined_at?: string | null
          completed_at?: string | null
          progress?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_challenge_entries_challenge_id_fkey'
            columns: ['challenge_id']
            referencedRelation: 'daily_challenges'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_challenge_entries_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      team_sessions: {
        Row: {
          id: string
          title: string
          description: string | null
          sport_id: number
          location: string | null
          start_time: string
          duration_minutes: number | null
          created_by: string
          max_participants: number | null
          group_code: string | null
          status: Database['public']['Enums']['session_status_enum']
          stats: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          sport_id: number
          location?: string | null
          start_time: string
          duration_minutes?: number | null
          created_by?: string
          max_participants?: number | null
          group_code?: string | null
          status?: Database['public']['Enums']['session_status_enum']
          stats?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          sport_id?: number
          location?: string | null
          start_time?: string
          duration_minutes?: number | null
          created_by?: string
          max_participants?: number | null
          group_code?: string | null
          status?: Database['public']['Enums']['session_status_enum']
          stats?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'team_sessions_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_sessions_sport_id_fkey'
            columns: ['sport_id']
            referencedRelation: 'sports'
            referencedColumns: ['id']
          }
        ]
      }
      team_session_drills: {
        Row: {
          session_id: string
          drill_id: string
          position: number
        }
        Insert: {
          session_id: string
          drill_id: string
          position?: number
        }
        Update: {
          session_id?: string
          drill_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: 'team_session_drills_drill_id_fkey'
            columns: ['drill_id']
            referencedRelation: 'drills'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_session_drills_session_id_fkey'
            columns: ['session_id']
            referencedRelation: 'team_sessions'
            referencedColumns: ['id']
          }
        ]
      }
      team_session_participants: {
        Row: {
          session_id: string
          user_id: string
          status: Database['public']['Enums']['session_participant_status_enum']
          attempts: number
          score: string | null
          joined_at: string | null
          completed_at: string | null
          notes: string | null
        }
        Insert: {
          session_id: string
          user_id: string
          status?: Database['public']['Enums']['session_participant_status_enum']
          attempts?: number
          score?: string | null
          joined_at?: string | null
          completed_at?: string | null
          notes?: string | null
        }
        Update: {
          session_id?: string
          user_id?: string
          status?: Database['public']['Enums']['session_participant_status_enum']
          attempts?: number
          score?: string | null
          joined_at?: string | null
          completed_at?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'team_session_participants_session_id_fkey'
            columns: ['session_id']
            referencedRelation: 'team_sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_session_participants_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      streaks: {
        Row: {
          user_id: string
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
        }
        Insert: {
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
        }
        Update: {
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'streaks_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      leaderboard_7d: {
        Row: {
          sport_id: number | null
          user_id: string | null
          score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_streak: {
        Args: {
          p_user: string
        }
        Returns: void
      }
    }
    Enums: {
      visibility_enum: 'public' | 'followers' | 'private'
      drill_difficulty_enum: 'beginner' | 'intermediate' | 'advanced'
      achievement_type_enum: 'badge' | 'milestone'
      session_status_enum: 'upcoming' | 'active' | 'completed'
      session_participant_status_enum: 'invited' | 'joined' | 'in_progress' | 'completed' | 'declined'
      challenge_difficulty_enum: 'easy' | 'medium' | 'hard'
      challenge_status_enum: 'draft' | 'active' | 'expired'
      challenge_entry_status_enum: 'joined' | 'completed' | 'abandoned'
    }
  }
}
