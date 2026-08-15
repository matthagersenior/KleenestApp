-- Internal authorization helper; business CRUD RPCs perform the authorization check themselves.
revoke execute on function public.business_can_manage(uuid) from anon, authenticated, public;
