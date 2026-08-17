# Authority Consolidation — Gamification Pass

Date: 2026-08-17
Branch: `refactor/monolith-removal`

## Found

The active game engine advertised variable XP awards and attempted to call two non-canonical reward/progression methods. `KleenestProgressionActionBridgeV1` exposed `recordAction`, not the `record` method the game engine invoked, and `KleenestRewards` did not expose the `award` method the game engine invoked. The database's authoritative progression action is `record_progression_action`, and the enabled game action is `game_play` worth 10 points.

The game engine also exposed a `battle` surface whose button only displayed a browser alert; no multiplayer mutation/backend contract existed.

## Fixes

- Added the real `KleenestRewards.award()` bridge to the existing `record_progression_action` RPC.
- Added completion-cycle promise deduplication so the game's two compatibility calls cannot award twice during one completion.
- Routed the progression bridge's `game_completed` compatibility call to the canonical reward bridge.
- Changed the game engine to use the real server-authorized `game_play` reward rather than claiming client-supplied XP values.
- Updated the completion copy to state the verified server-defined 10 progression points.
- Removed the unimplemented multiplayer `battle` game from the exposed game registry and reject unknown game IDs instead of presenting a fake control.

## Verification

Production inspection confirmed `record_progression_action(p_action text,p_reference_id uuid)` is the authoritative scoring RPC and that `progression_actions.game_play` is enabled at 10 points. The RPC itself derives points from the server-side action definition and updates the user's point balance/streak.

No new database reward table, RPC, or scoring authority was introduced.
