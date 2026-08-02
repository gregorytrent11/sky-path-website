// Hand-written to match supabase/migrations/20260731220000_init_schema.sql.
// Regenerate with `supabase gen types typescript` once the CLI is linked.

export type DogStatus = "draft" | "published" | "pending" | "adopted" | "archived";
export type DogSex = "male" | "female" | "unknown";
export type DogAgeCategory = "puppy" | "young" | "adult" | "senior";
export type DogSize = "small" | "medium" | "large" | "xlarge";
export type DogEnergyLevel = "low" | "medium" | "high";
export type MediaType = "image" | "video";
export type SubmissionFormType =
  | "contact"
  | "volunteer"
  | "request_help"
  | "adopt_application"
  | "foster_application";
export type SubmissionStatus = "new" | "in_progress" | "resolved" | "archived";
export type EventStatus = "draft" | "published" | "archived";

export type Dog = {
  id: string;
  name: string;
  slug: string;
  status: DogStatus;
  breed: string | null;
  sex: DogSex | null;
  age_category: DogAgeCategory | null;
  weight_lbs: number | null;
  size: DogSize | null;
  good_with_kids: boolean | null;
  good_with_dogs: boolean | null;
  good_with_cats: boolean | null;
  house_trained: boolean | null;
  energy_level: DogEnergyLevel | null;
  description: string | null;
  foster_notes: string | null;
  intake_date: string | null;
  location: string | null;
  primary_photo_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type DogInsert = Partial<Omit<Dog, "id" | "created_at" | "updated_at">> &
  Pick<Dog, "name" | "slug">;
export type DogUpdate = Partial<Omit<Dog, "id" | "created_at" | "updated_at">>;

export type DogMedia = {
  id: string;
  dog_id: string;
  media_type: MediaType;
  storage_path: string;
  url: string;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  bytes: number | null;
  sort_order: number;
  is_primary: boolean;
  alt_text: string | null;
  created_at: string;
};

export type Submission = {
  id: string;
  form_type: SubmissionFormType;
  status: SubmissionStatus;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  payload: Record<string, unknown>;
  dog_id: string | null;
  turnstile_verified: boolean;
  ip_hash: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  status: EventStatus;
  event_date: string | null;
  location: string | null;
  summary: string | null;
  body: string | null;
  cover_image_url: string | null;
  cover_focal_x: number;
  cover_focal_y: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type EventInsert = Partial<Omit<Event, "id" | "created_at" | "updated_at">> &
  Pick<Event, "title" | "slug">;
export type EventUpdate = Partial<Omit<Event, "id" | "created_at" | "updated_at">>;

export type Database = {
  public: {
    Tables: {
      dogs: {
        Row: Dog;
        Insert: DogInsert;
        Update: DogUpdate;
        Relationships: [];
      };
      dog_media: {
        Row: DogMedia;
        Insert: Partial<Omit<DogMedia, "id" | "created_at">> &
          Pick<DogMedia, "dog_id" | "media_type" | "storage_path" | "url">;
        Update: Partial<Omit<DogMedia, "id" | "created_at">>;
        Relationships: [];
      };
      submissions: {
        Row: Submission;
        Insert: Partial<Omit<Submission, "id" | "created_at">> &
          Pick<Submission, "form_type" | "name" | "email">;
        Update: Partial<Omit<Submission, "id" | "created_at">>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
