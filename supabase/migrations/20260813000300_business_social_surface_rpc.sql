-- Business verification/tier and community read APIs. Keep authorization in SQL, not browser state.
create or replace function public.get_business_verification_status(p_business_id uuid)
returns jsonb language sql security definer set search_path=public,auth as $$
  select jsonb_build_object('business_id',business_id,'verification_state',verification_state,'tier',tier)
  from business_gamification_profiles where business_id=p_business_id;
$$;

create or replace function public.set_business_verification_status(p_business_id uuid,p_state text,p_tier text default 'standard')
returns jsonb language plpgsql security definer set search_path=public,auth as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_state not in ('unverified','pending','verified','suspended') then raise exception 'invalid_verification_state'; end if;
  if p_tier not in ('standard','preferred','partner','premium') then raise exception 'invalid_business_tier'; end if;
  insert into business_gamification_profiles(business_id,verification_state,tier) values(p_business_id,p_state,p_tier)
  on conflict(business_id) do update set verification_state=excluded.verification_state,tier=excluded.tier,updated_at=now();
  return jsonb_build_object('business_id',p_business_id,'verification_state',p_state,'tier',p_tier);
end $$;

create or replace function public.get_community_feed(p_limit integer default 50,p_cursor timestamptz default null)
returns table(id uuid,user_id uuid,activity_type text,metadata jsonb,created_at timestamptz) language sql security definer set search_path=public,auth as $$
  select id,user_id,reason,metadata,created_at from points_ledger where p_cursor is null or created_at < p_cursor order by created_at desc limit greatest(1,least(p_limit,100));
$$;

create or replace function public.get_community_trending(p_limit integer default 25)
returns table(review_id uuid,like_count bigint) language sql security definer set search_path=public,auth as $$
  select review_id,count(*) from review_likes group by review_id order by count(*) desc limit greatest(1,least(p_limit,50));
$$;

create or replace function public.get_community_profile_summary(p_user_id uuid)
returns jsonb language sql security definer set search_path=public,auth as $$
  select jsonb_build_object('user_id',p_user_id,'points',coalesce((select sum(points) from points_ledger where user_id=p_user_id),0),'badges',coalesce((select count(*) from user_badges where user_id=p_user_id),0),'followers',coalesce((select count(*) from user_follows where followed_id=p_user_id),0),'following',coalesce((select count(*) from user_follows where follower_id=p_user_id),0),'likes',coalesce((select count(*) from review_likes where user_id=p_user_id),0),'streak',coalesce((select current_streak from user_streaks where user_id=p_user_id),0),'reviews',coalesce((select review_total from user_gamification_stats where user_id=p_user_id),0),'checkins',coalesce((select checkin_total from user_gamification_stats where user_id=p_user_id),0));
$$;

revoke all on function public.set_business_verification_status(uuid,text,text) from public;
grant execute on function public.set_business_verification_status(uuid,text,text) to authenticated;
