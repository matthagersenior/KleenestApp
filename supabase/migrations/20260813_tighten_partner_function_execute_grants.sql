-- Harden partner RPC boundaries before native clients are enabled.
-- Supabase recommends explicit function EXECUTE grants for exposed functions.
revoke execute on function public.business_partner_program_usage(uuid) from anon, public;
revoke execute on function public.list_my_partner_memberships() from anon, public;
grant execute on function public.business_partner_program_usage(uuid) to authenticated;
grant execute on function public.list_my_partner_memberships() to authenticated;
