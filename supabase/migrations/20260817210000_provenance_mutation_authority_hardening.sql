-- Provenance and observation records must not be directly mutated by public client roles.
-- Client writes must use the existing server-authoritative observation/verification
-- functions; trusted ingestion continues through its existing privileged path.
revoke insert, update, delete, truncate, references, trigger on public.external_observations from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.location_sources from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.location_amenity_observations from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.location_quality_observations from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.location_bathroom_verifications from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.data_feature_events from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.location_confidence from anon, authenticated;

-- Read access remains governed by the existing table grants and RLS policies.
