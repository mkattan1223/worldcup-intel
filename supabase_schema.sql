-- Run this in your Supabase SQL editor to create the required tables.

create table if not exists public.matches (
  id                bigint primary key,
  utc_date          timestamptz,
  status            text,
  matchday          int,
  stage             text,
  "group"           text,
  venue             text,
  home_team_id      bigint,
  home_team_name    text,
  home_team_tla     text,
  home_team_crest   text,
  away_team_id      bigint,
  away_team_name    text,
  away_team_tla     text,
  away_team_crest   text,
  score_winner      text,
  score_duration    text,
  ft_home           int,
  ft_away           int,
  ht_home           int,
  ht_away           int,
  fetched_at        timestamptz default now()
);

create table if not exists public.teams (
  id           bigint primary key,
  name         text,
  short_name   text,
  tla          text,
  crest        text,
  address      text,
  website      text,
  founded      int,
  club_colors  text,
  venue        text,
  fetched_at   timestamptz default now()
);

create table if not exists public.standings (
  id              bigserial primary key,
  team_id         bigint references public.teams(id),
  team_name       text,
  team_tla        text,
  stage           text,
  "group"         text,
  position        int,
  played          int,
  won             int,
  draw            int,
  lost            int,
  goals_for       int,
  goals_against   int,
  goal_difference int,
  points          int,
  fetched_at      timestamptz default now(),
  unique (team_id, stage, "group")
);

-- Optional: enable Row Level Security (recommended for production)
-- alter table public.matches enable row level security;
-- alter table public.teams enable row level security;
-- alter table public.standings enable row level security;
