-- Server-authoritative RPCs for the modular gamification/social domain.
create table if not exists public.user_gamification_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  review_total integer not null default 0,
  checkin_total integer not null default 0,
  distinct_places_total integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.business_gamification_profiles (
  business_id uuid primary key,
  verification_state text not null default 'unverified' check (verification_state in ('unverified','pending','verified','suspended')),
  tier text not null default 'standard' check (tier in ('standard','preferred','partner','premium')),
  updated_at timestamptz not null default now()
);
alter table public.user_gamification_stats enable row level security;
alter table public.business_gamification_profiles enable row level security;

drop policy if exists user_gamification_stats_owner_select on public.user_gamification_stats;
create policy user_gamification_stats_owner_select on public.user_gamification_stats for select using (auth.uid() = user_id);

create or replace function public.get_gamification_profile()
returns jsonb language sql security definer set search_path=public,auth as $$
  select jsonb_build_object(
    'user_id', auth.uid(),
    'points', coalesce((select sum(points) from points_ledger where user_id=auth.uid()),0),
    'review_total', coalesce((select review_total from user_gamification_stats where user_id=auth.uid()),0),
    'checkin_total', coalesce((select checkin_total from user_gamification_stats where user_id=auth.uid()),0),
    'distinct_places_total', coalesce((select distinct_places_total from user_gamification_stats where user_id=auth.uid()),0)
  );
$$;

create or replace function public.get_gamification_leaderboard(p_scope text default 'global', p_limit integer default 50)
returns table(user_id uuid, points bigint, rank bigint) language sql security definer set search_path=public,auth as $$
  select user_id, sum(points)::bigint, row_number() over(order by sum(points) desc)
  from points_ledger group by user_id order by sum(points) desc limit greatest(1,least(p_limit,100));
$$;

create or replace function public.get_gamification_badges()
returns setof gamification_badges language sql security definer set search_path=public,auth as $$ select * from gamification_badges where active order by points_reward, name; $$;

create or replace function public.get_user_badges(p_user_id uuid default null)
returns setof user_badges language sql security definer set search_path=public,auth as $$ select * from user_badges where user_id=coalesce(p_user_id,auth.uid()) order by awarded_at desc; $$;

create or replace function public.get_user_streak()
returns setof user_streaks language sql security definer set search_path=public,auth as $$ select * from user_streaks where user_id=auth.uid(); $$;

create or replace function public.award_gamification_points(p_reason text, p_metadata jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare pts integer; total bigint;
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 pts:=case p_reason when 'check_in' then 10 when 'review' then 25 when 'review_like' then 2 when 'follow' then 1 when 'verified_business_review' then 10 when 'streak_day' then 5 when 'contest_entry' then 5 when 'contest_win' then 250 when 'contest_place' then 100 when 'community_helpful' then 15 else 0 end;
 if pts=0 then raise exception 'unknown_point_reason'; end if;
 insert into points_ledger(user_id,points,reason,metadata) values(auth.uid(),pts,p_reason,coalesce(p_metadata,'{}'::jsonb));
 select coalesce(sum(points),0) into total from points_ledger where user_id=auth.uid();
 return jsonb_build_object('awarded',pts,'total_points',total);
end $$;

create or replace function public.record_gamification_activity(p_activity_type text,p_metadata jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare today date:=current_date; last_date date; streak integer:=0; longest integer:=0; delta integer:=0; stats user_gamification_stats;
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 insert into user_streaks(user_id,current_streak,longest_streak,last_activity_date) values(auth.uid(),1,1,today)
 on conflict(user_id) do update set
 current_streak=case when user_streaks.last_activity_date=today then user_streaks.current_streak when user_streaks.last_activity_date=today-1 then user_streaks.current_streak+1 else 1 end,
 longest_streak=greatest(user_streaks.longest_streak,case when user_streaks.last_activity_date=today then user_streaks.current_streak when user_streaks.last_activity_date=today-1 then user_streaks.current_streak+1 else 1 end),
 last_activity_date=today,updated_at=now();
 select * into stats from user_gamification_stats where user_id=auth.uid();
 if p_activity_type='review' then insert into user_gamification_stats(user_id,review_total) values(auth.uid(),1) on conflict(user_id) do update set review_total=user_gamification_stats.review_total+1,updated_at=now(); end if;
 if p_activity_type='check_in' then insert into user_gamification_stats(user_id,checkin_total) values(auth.uid(),1) on conflict(user_id) do update set checkin_total=user_gamification_stats.checkin_total+1,updated_at=now(); end if;
 if p_activity_type in ('check_in','review','community_helpful') then perform award_gamification_points(p_activity_type,p_metadata); end if;
 return jsonb_build_object('activity',p_activity_type,'streak',(select current_streak from user_streaks where user_id=auth.uid()));
end $$;

create or replace function public.get_points_history(p_limit integer default 100)
returns setof points_ledger language sql security definer set search_path=public,auth as $$ select * from points_ledger where user_id=auth.uid() order by created_at desc limit greatest(1,least(p_limit,200)); $$;

create or replace function public.get_contests(p_status text default 'active')
returns setof contests language sql security definer set search_path=public,auth as $$ select * from contests where active and (p_status='active' or ends_at < now()) order by starts_at desc; $$;
create or replace function public.get_contest(p_contest_id uuid)
returns setof contests language sql security definer set search_path=public,auth as $$ select * from contests where id=p_contest_id and active; $$;
create or replace function public.join_contest(p_contest_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth as $$ begin if auth.uid() is null then raise exception 'not_authenticated'; end if; insert into contest_entries(contest_id,user_id) values(p_contest_id,auth.uid()) on conflict do nothing; perform award_gamification_points('contest_entry',jsonb_build_object('contest_id',p_contest_id)); return jsonb_build_object('joined',true); end $$;
create or replace function public.leave_contest(p_contest_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth as $$ begin delete from contest_entries where contest_id=p_contest_id and user_id=auth.uid(); return jsonb_build_object('left',true); end $$;
create or replace function public.submit_contest_entry(p_contest_id uuid,p_entry jsonb)
returns jsonb language plpgsql security definer set search_path=public,auth as $$ declare score integer:=coalesce((p_entry->>'score')::integer,0); begin update contest_entries set entry=p_entry,score=score,updated_at=now() where contest_id=p_contest_id and user_id=auth.uid(); return jsonb_build_object('submitted',true,'score',score); end $$;
create or replace function public.get_contest_leaderboard(p_contest_id uuid,p_limit integer default 50)
returns table(user_id uuid,score integer,rank bigint) language sql security definer set search_path=public,auth as $$ select user_id,score,row_number() over(order by score desc) from contest_entries where contest_id=p_contest_id order by score desc limit greatest(1,least(p_limit,100)); $$;

create or replace function public.list_user_favorites(p_limit integer default 100) returns setof user_favorites language sql security definer set search_path=public,auth as $$ select * from user_favorites where user_id=auth.uid() order by created_at desc limit greatest(1,least(p_limit,200)); $$;
create or replace function public.add_user_favorite(p_place_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth as $$ begin insert into user_favorites(user_id,place_id) values(auth.uid(),p_place_id) on conflict do nothing; return jsonb_build_object('favorite',true); end $$;
create or replace function public.remove_user_favorite(p_place_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth as $$ begin delete from user_favorites where user_id=auth.uid() and place_id=p_place_id; return jsonb_build_object('favorite',false); end $$;
create or replace function public.list_following(p_user_id uuid default null,p_limit integer default 100) returns setof user_follows language sql security definer set search_path=public,auth as $$ select * from user_follows where follower_id=coalesce(p_user_id,auth.uid()) order by created_at desc limit greatest(1,least(p_limit,200)); $$;
create or replace function public.list_followers(p_user_id uuid default null,p_limit integer default 100) returns setof user_follows language sql security definer set search_path=public,auth as $$ select * from user_follows where followed_id=coalesce(p_user_id,auth.uid()) order by created_at desc limit greatest(1,least(p_limit,200)); $$;
create or replace function public.follow_user(p_user_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth as $$ begin if p_user_id=auth.uid() then raise exception 'cannot_follow_self'; end if; insert into user_follows(follower_id,followed_id) values(auth.uid(),p_user_id) on conflict do nothing; perform award_gamification_points('follow'); return jsonb_build_object('following',true); end $$;
create or replace function public.unfollow_user(p_user_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth as $$ begin delete from user_follows where follower_id=auth.uid() and followed_id=p_user_id; return jsonb_build_object('following',false); end $$;
create or replace function public.list_liked_reviews(p_limit integer default 100) returns setof review_likes language sql security definer set search_path=public,auth as $$ select * from review_likes where user_id=auth.uid() order by created_at desc limit greatest(1,least(p_limit,200)); $$;
create or replace function public.like_review(p_review_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth as $$ begin insert into review_likes(user_id,review_id) values(auth.uid(),p_review_id) on conflict do nothing; return jsonb_build_object('liked',true); end $$;
create or replace function public.unlike_review(p_review_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth as $$ begin delete from review_likes where user_id=auth.uid() and review_id=p_review_id; return jsonb_build_object('liked',false); end $$;
create or replace function public.list_family_members(p_limit integer default 50) returns setof family_members language sql security definer set search_path=public,auth as $$ select * from family_members where user_id=auth.uid() order by created_at desc limit greatest(1,least(p_limit,100)); $$;
create or replace function public.add_family_member(p_member jsonb) returns family_members language plpgsql security definer set search_path=public,auth as $$ declare r family_members; begin insert into family_members(user_id,display_name,relationship,birth_year) values(auth.uid(),coalesce(p_member->>'display_name','Family member'),p_member->>'relationship',nullif(p_member->>'birth_year','')::integer) returning * into r; return r; end $$;
create or replace function public.update_family_member(p_member_id uuid,p_member jsonb) returns family_members language plpgsql security definer set search_path=public,auth as $$ declare r family_members; begin update family_members set display_name=coalesce(p_member->>'display_name',display_name),relationship=coalesce(p_member->>'relationship',relationship),birth_year=coalesce(nullif(p_member->>'birth_year','')::integer,birth_year),updated_at=now() where id=p_member_id and user_id=auth.uid() returning * into r; return r; end $$;
create or replace function public.remove_family_member(p_member_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth as $$ begin delete from family_members where id=p_member_id and user_id=auth.uid(); return jsonb_build_object('removed',true); end $$;

revoke all on function public.get_gamification_profile() from public;
grant execute on function public.get_gamification_profile() to authenticated;
