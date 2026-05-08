create table if not exists alarms (
  id text primary key,
  label text not null,
  time text not null,
  repeat_days text[] not null default '{}',
  challenge_id text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists wake_history (
  id bigserial primary key,
  alarm_id text,
  woke_at timestamptz not null default now(),
  success boolean not null,
  xp integer not null default 0
);

create table if not exists challenge_results (
  id bigserial primary key,
  alarm_id text not null,
  challenge_id text not null,
  success boolean not null,
  confidence numeric not null,
  reason text,
  labels jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
