-- Kleenest Admin audit database changes applied to project ss...dtasje on 2026-08-16.
-- Captures the production definitions so the repository records the change.

create or replace function public.admin_get_overview()
returns jsonb language plpgsql security definer
set search_path=public,pg_temp
as $$
declare v jsonb;
begin
  if not exists(select 1 from profiles where id=auth.uid() and (is_admin=true or lower(coalesce(role::text,'')) in ('admin','owner','platform_admin'))) then
    raise exception 'admin access required';
  end if;
  select jsonb_build_object(
    'users',(select count(*) from profiles),
    'businesses',(select count(*) from businesses),
    'locations',(select count(*) from locations),
    'active_locations',(select count(*) from locations where is_active),
    'checkins',(select count(*) from check_ins),
    'reviews',(select count(*) from reviews),
    'favorites',(select count(*) from favorites),
    'reports',(select count(*) from reports),
    'pending_reports',(select count(*) from reports where status::text in ('pending','reviewing')),
    'events',(select count(*) from business_events),
    'campaigns',(select count(*) from business_campaigns)+(select count(*) from enterprise_partner_campaigns),
    'promotions',(select count(*) from promotions),
    'contests',(select count(*) from contests),
    'contest_entries',(select count(*) from contest_entries),
    'qr_codes',(select count(*) from qr_codes),
    'qr_scans',(select count(*) from analytics_events where event_type='qr_scan'),
    'social_posts',(select count(*) from social_posts),
    'social_reports',(select count(*) from social_post_reports where status in ('pending','reviewing')),
    'points_awarded',(select coalesce(sum(points_awarded),0) from point_transactions),
    'bathroom_verifications',(select count(*) from location_bathroom_verifications),
    'pending_businesses',(select count(*) from businesses where verification_status='pending'),
    'pending_certifications',(select count(*) from business_certifications where status='pending'),
    'support_open',(select count(*) from support_requests where status not in ('resolved','closed')),
    'feedback_open',(select count(*) from user_feedback where status not in ('resolved','closed')),
    'deletion_requests',(select count(*) from account_deletion_requests where status in ('requested','processing')),
    'partner_networks',(select count(*) from enterprise_partner_networks),
    'partner_agreements',(select count(*) from partner_agreements),
    'subscriptions',(select count(*) from subscriptions),
    'health','Protected') into v;
  return v;
end; $$;

create or replace function public.admin_crud_gateway(p_resource text,p_action text,p_id uuid default null,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer
set search_path=public,pg_temp
as $$
declare
  v_table text:=lower(trim(p_resource)); v_action text:=lower(trim(p_action));
  v_sql text; v_result jsonb; v_cols text; v_sets text; v_readonly boolean:=false;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not exists(select 1 from profiles where id=auth.uid() and (is_admin=true or lower(coalesce(role::text,'')) in ('admin','owner','platform_admin'))) then raise exception 'admin authorization required'; end if;
  if v_table not in ('profiles','businesses','locations','location_hours','amenities','location_amenities','location_fixtures','location_photos','qr_codes','check_ins','reviews','review_photos','review_likes','review_amenity_feedback','favorites','follows','social_posts','social_post_likes','social_post_comments','social_post_saves','social_post_reports','social_activity','reports','badges','user_badges','point_transactions','level_definitions','user_streaks','progression_actions','progression_games','progression_challenges','social_challenge_entries','progression_metric_events','business_members','business_campaigns','business_events','contests','contest_entries','promotions','promotion_redemptions','partner_programs','partner_agreements','partner_program_locations','partner_program_memberships','membership_clubs','club_memberships','single_use_access_offers','single_use_access_purchases','business_certifications','certification_tiers','enterprise_partner_networks','enterprise_partner_network_members','enterprise_partner_network_metrics','enterprise_partner_campaigns','enterprise_partner_campaign_outcomes','enterprise_partner_allocations','business_engagement_attributions','business_metric_leaderboards','analytics_events','preferred_location_activations','preferred_usage_events','location_visits','location_bathroom_verifications','location_verification_points','support_requests','user_feedback','account_deletion_requests','admin_capability_audit','demo_identity_registry','subscription_plans','subscriptions','pricing_catalog','app_business_memberships','business_overview','community_leaderboard','contest_leaderboards','partner_preferred_usage_analytics','preferred_business_analytics','public_locations','public_profiles','user_progression_metric_summary') then raise exception 'admin resource not allowed: %',p_resource; end if;
  if v_table in ('profiles','subscriptions','admin_capability_audit','account_deletion_requests','analytics_events','progression_metric_events','point_transactions','user_streaks','social_activity','notifications','messages','app_business_memberships','business_overview','community_leaderboard','contest_leaderboards','partner_preferred_usage_analytics','preferred_business_analytics','public_locations','public_profiles','user_progression_metric_summary','businesses','business_certifications','enterprise_partner_networks','enterprise_partner_network_members','enterprise_partner_campaigns','enterprise_partner_campaign_outcomes','enterprise_partner_allocations') then v_readonly:=true; end if;
  if v_action not in ('list','create','update','delete') then raise exception 'admin action not allowed: %',p_action; end if;
  if v_action<>'list' and v_readonly then raise exception 'resource is read-only; use its protected Admin operation'; end if;
  if v_action='list' then v_sql:=format('select coalesce(jsonb_agg(to_jsonb(x)),''[]''::jsonb) from (select * from public.%I limit 200) x',v_table); execute v_sql into v_result; return v_result; end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'payload must be a JSON object'; end if;
  if v_action='delete' then if p_id is null then raise exception 'record id required'; end if; v_sql:=format('delete from public.%I where id=$1 returning to_jsonb(%I.*)',v_table,v_table); execute v_sql into v_result using p_id; if v_result is null then raise exception 'record not found'; end if; return v_result; end if;
  if v_action='update' and p_id is null then raise exception 'record id required'; end if;
  select string_agg(format('%I',key),', ' order by key),string_agg(format('%I = r.%I',key,key),', ' order by key) into v_cols,v_sets from jsonb_object_keys(p_payload) key where key<>'id';
  if v_cols is null then raise exception 'no editable fields supplied'; end if;
  if v_action='create' then v_sql:=format('insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I,$1) returning to_jsonb(%I.*)',v_table,v_cols,v_cols,v_table,v_table); execute v_sql into v_result using p_payload; return v_result; end if;
  v_sql:=format('update public.%I t set %s from jsonb_populate_record(null::public.%I,$1) r where t.id=$2 returning to_jsonb(t.*)',v_table,v_sets,v_table); execute v_sql into v_result using p_payload,p_id; if v_result is null then raise exception 'record not found'; end if; return v_result;
end; $$;

alter view public.public_locations set (security_invoker = true);
