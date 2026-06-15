-- SpeakEasy / Coco voice tutor — Supabase schema

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  scenario text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds int,
  turn_count int default 0,
  transcript jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- RLS ON. No public access. Backend uses the service key only.
alter table sessions enable row level security;
-- (No policies = no anon access. Service key bypasses RLS.)
