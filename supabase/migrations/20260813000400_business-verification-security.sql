-- Tighten business verification writes: verification state/tier is never user-self-service.
create or replace function public.set_business_verification_status(p_business_id uuid,p_state text,p_tier text default 'standard')
returns jsonb language plpgsql security definer set search_path=public,auth as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if coalesce(auth.jwt()->'app_metadata'->>'role','') <> 'admin' then raise exception 'admin_required'; end if;
  if p_state not in ('unverified','pending','verified','suspended') then raise exception 'invalid_verification_state'; end if;
  if p_tier not in ('standard','preferred','partner','premium') then raise exception 'invalid_business_tier'; end if;
  insert into business_gamification_profiles(business_id,verification_state,tier) values(p_business_id,p_state,p_tier)
  on conflict(business_id) do update set verification_state=excluded.verification_state,tier=excluded.tier,updated_at=now();
  return jsonb_build_object('business_id',p_business_id,'verification_state',p_state,'tier',p_tier);
end $$;
