begin;

revoke insert, update, delete, truncate, references, trigger on table public.pricing_catalog from anon, authenticated;
grant select on table public.pricing_catalog to anon, authenticated;

create or replace view public.pricing_authority_v1 as
select id, code, name, category, price_cents, interval, max_users, max_locations, price_note, features, active, created_at, updated_at
from public.pricing_catalog
where active = true;

grant select on public.pricing_authority_v1 to anon, authenticated;
comment on view public.pricing_authority_v1 is 'Canonical read-only pricing contract for public pricing and upgrade UI. Do not read pricing_plans for current pricing.';
comment on table public.pricing_catalog is 'Canonical pricing read model. Public clients may read active products; mutations belong to protected platform administration/checkout workflows.';

commit;
