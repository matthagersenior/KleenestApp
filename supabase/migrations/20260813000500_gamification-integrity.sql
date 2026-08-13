-- Make rewards and contest scoring server-authoritative.
create or replace function public.submit_contest_entry(p_contest_id uuid,p_entry jsonb)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare metric text; computed_score integer:=0; c contests;
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 select * into c from contests where id=p_contest_id and active;
 if c.id is null then raise exception 'contest_unavailable'; end if;
 metric:=coalesce(c.rules->>'metric','points');
 if metric='checkins' then select coalesce(checkin_total,0) into computed_score from user_gamification_stats where user_id=auth.uid();
 elsif metric='reviews' then select coalesce(review_total,0) into computed_score from user_gamification_stats where user_id=auth.uid();
 elsif metric='streak' then select coalesce(current_streak,0) into computed_score from user_streaks where user_id=auth.uid();
 else select coalesce(sum(points),0)::integer into computed_score from points_ledger where user_id=auth.uid(); end if;
 insert into contest_entries(contest_id,user_id,score,entry) values(p_contest_id,auth.uid(),computed_score,coalesce(p_entry,'{}'::jsonb))
 on conflict(contest_id,user_id) do update set score=excluded.score,entry=excluded.entry,updated_at=now();
 return jsonb_build_object('submitted',true,'score',computed_score,'metric',metric);
end $$;

create or replace function public.record_gamification_activity(p_activity_type text,p_metadata jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare today date:=current_date; new_streak integer; old_streak integer:=0;
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 select current_streak into old_streak from user_streaks where user_id=auth.uid();
 insert into user_streaks(user_id,current_streak,longest_streak,last_activity_date) values(auth.uid(),1,1,today)
 on conflict(user_id) do update set
 current_streak=case when user_streaks.last_activity_date=today then user_streaks.current_streak when user_streaks.last_activity_date=today-1 then user_streaks.current_streak+1 else 1 end,
 longest_streak=greatest(user_streaks.longest_streak,case when user_streaks.last_activity_date=today then user_streaks.current_streak when user_streaks.last_activity_date=today-1 then user_streaks.current_streak+1 else 1 end),
 last_activity_date=today,updated_at=now();
 select current_streak into new_streak from user_streaks where user_id=auth.uid();
 insert into user_gamification_stats(user_id) values(auth.uid()) on conflict do nothing;
 if p_activity_type='review' then update user_gamification_stats set review_total=review_total+1,updated_at=now() where user_id=auth.uid(); end if;
 if p_activity_type='check_in' then update user_gamification_stats set checkin_total=checkin_total+1,updated_at=now() where user_id=auth.uid(); end if;
 if p_activity_type in ('check_in','review','community_helpful') then perform award_gamification_points(p_activity_type,p_metadata); end if;
 if new_streak>old_streak then perform award_gamification_points('streak_day',jsonb_build_object('streak',new_streak)); end if;
 if new_streak>=7 then insert into user_badges(user_id,badge_id,metadata) select auth.uid(),id,jsonb_build_object('streak',new_streak) from gamification_badges where code='week-streak' on conflict do nothing; end if;
 if new_streak>=30 then insert into user_badges(user_id,badge_id,metadata) select auth.uid(),id,jsonb_build_object('streak',new_streak) from gamification_badges where code='month-streak' on conflict do nothing; end if;
 return jsonb_build_object('activity',p_activity_type,'streak',new_streak);
end $$;
