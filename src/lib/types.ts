// src/lib/types.ts
export type Note = {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  created_at: string;
};