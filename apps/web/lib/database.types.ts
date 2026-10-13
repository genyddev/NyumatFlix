export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type RightsStatus = "unverified" | "approved" | "rejected";
export type SourceType = "internet_archive" | "bunny_stream";
export type PublicationStatus = "draft" | "published";

export type MovieRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  synopsis: string;
  year: number;
  duration_minutes: number;
  age_rating: string;
  genres: string[];
  poster_path: string | null;
  backdrop_path: string | null;
  rights_status: RightsStatus;
  rights_basis: string;
  rights_notes: string;
  rights_document_path: string | null;
  source_type: SourceType | null;
  internet_archive_identifier: string | null;
  bunny_library_id: string | null;
  bunny_video_id: string | null;
  publication_status: PublicationStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type MovieInsert = Omit<MovieRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type MovieUpdate = Partial<MovieInsert>;

export type Database = {
  public: {
    Tables: {
      movies: {
        Row: MovieRow;
        Insert: MovieInsert;
        Update: MovieUpdate;
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string; created_at: string; added_by: string | null };
        Insert: { user_id: string; created_at?: string; added_by?: string | null };
        Update: { added_by?: string | null };
        Relationships: [];
      };
      admin_audit_log: {
        Row: { id: number; admin_user_id: string | null; action: string; movie_id: string | null; old_record: Json | null; new_record: Json | null; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: { check_user_id?: string }; Returns: boolean };
    };
    Enums: {
      rights_status: RightsStatus;
      source_type: SourceType;
      publication_status: PublicationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
