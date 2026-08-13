-- Modular gamification/social foundation. Existing application tables remain authoritative for places/reviews/businesses.
create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  relationship text,
  birth_year integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  review_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, review_id)
);

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.gamification_badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  icon text,
  points_reward integer not null default 0,
  criteria jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.gamification_badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  primary key (user_id, badge_id)
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  entry_points integer not null default 0,
  winner_points integer not null default 250,
  rules jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.contest_entries (
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null default 0,
  entry jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (contest_id, user_id)
);

create index if not exists user_favorites_place_idx on public.user_favorites(place_id);
create index if not exists user_follows_followed_idx on public.user_follows(followed_id);
create index if not exists review_likes_review_idx on public.review_likes(review_id);
create index if not exists points_ledger_user_created_idx on public.points_ledger(user_id, created_at desc);
create index if not exists user_badges_user_idx on public.user_badges(user_id);
create index if not exists contest_entries_score_idx on public.contest_entries(contest_id, score desc);

alter table public.user_favorites enable row level security;
alter table public.user_follows enable row level security;
alter table public.family_members enable row level security;
alter table public.review_likes enable row level security;
alter table public.points_ledger enable row level security;
alter table public.gamification_badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_streaks enable row level security;
alter table public.contests enable row level security;
alter table public.contest_entries enable row level security;

-- Client mutations are intentionally routed through RPCs. These policies allow users to read their own private records while public-facing aggregates remain RPC-defined.
drop policy if exists user_favorites_owner_select on public.user_favorites;
create policy user_favorites_owner_select on public.user_favorites for select using (auth.uid() = user_id);

drop policy if exists user_follows_owner_select on public.user_follows;
create policy user_follows_owner_select on public.user_follows for select using (auth.uid() = follower_id or auth.uid() = followed_id);

drop policy if exists family_members_owner_select on public.family_members;
create policy family_members_owner_select on public.family_members for select using (auth.uid() = user_id);

drop policy if exists review_likes_owner_select on public.review_likes;
create policy review_likes_owner_select on public.review_likes for select using (auth.uid() = user_id);

drop policy if exists points_ledger_owner_select on public.points_ledger;
create policy points_ledger_owner_select on public.points_ledger for select using (auth.uid() = user_id);

drop policy if exists badges_public_select on public.gamification_badges;
create policy badges_public_select on public.gamification_badges for select using (active = true);

drop policy if exists user_badges_owner_select on public.user_badges;
create policy user_badges_owner_select on public.user_badges for select using (auth.uid() = user_id);

drop policy if exists streak_owner_select on public.user_streaks;
create policy streak_owner_select on public.user_streaks for select using (auth.uid() = user_id);

drop policy if exists contests_public_select on public.contests;
create policy contests_public_select on public.contests for select using (active = true);

drop policy if exists contest_entries_owner_select on public.contest_entries;
create policy contest_entries_owner_select on public.contest_entries for select using (auth.uid() = user_id);

insert into public.gamification_badges(code,name,description,icon,points_reward,criteria) values
('first-check-in','First Check-In','Complete your first verified check-in.','pin',25,'{"activity":"check_in","count":1}'),
('reviewer','Reviewer','Publish five helpful reviews.','star',100,'{"activity":"review","count":5}'),
('community-helper','Community Helper','Earn helpful community activity recognition.','heart',150,'{"activity":"community_helpful","count":10}'),
('week-streak','Week Streak','Maintain a seven-day activity streak.','flame',150,'{"streak":7}'),
('month-streak','Month Streak','Maintain a thirty-day activity streak.','fire',500,'{"streak":30}'),
('explorer','Explorer','Check in at twenty-five distinct places.','map',300,'{"distinct_places":25}'),
('contest-champion','Contest Champion','Win a community contest.','trophy',250,'{"contest_wins":1}')
on conflict (code) do update set name=excluded.name,description=excluded.description,icon=excluded.icon,points_reward=excluded.points_reward,criteria=excluded.criteria,active=true;
