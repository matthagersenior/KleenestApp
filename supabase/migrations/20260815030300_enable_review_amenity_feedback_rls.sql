-- Keep amenity feedback behind the existing controlled RPC rather than exposing the table directly.
alter table public.review_amenity_feedback enable row level security;
