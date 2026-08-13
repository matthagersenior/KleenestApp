# Native shell contracts

## Navigation
Home, Maps, Route, Details, Social, Profile, Business, Enterprise, Admin.

## Shared actions
Details request, route request, profile request, business request, activity event, reward event.

## Shared data domains
Auth, locations, reviews, favorites, family, follows, points, levels, badges, streaks, contests, rewards, business verification, business tiers, partner networks, campaigns, allocations, attribution, ROI, fleet analytics.

## Security
All authorization remains server-authoritative. Native clients never contain privileged Supabase secrets. Database access remains protected by RLS and explicit function grants.

## Deep links
Reserve an application-owned scheme for auth callbacks. Register the scheme with the Supabase Auth redirect allow list before enabling production native OAuth.
