# Executable Stress Matrix

| Area | Cases | Priority |
|---|---|---|
| Auth | login/signup/logout/refresh/expired/duplicate tap | P0 |
| Modal | tap/focus/keyboard/outside click/long press/double tap | P0 |
| Isolation | user A reads/writes user B data | P0 |
| Roles | user/business/partner/admin escalation attempts | P0 |
| Preferred | eligibility/activation/use/repeat/denied tier | P0 |
| Business | create/update/membership/analytics | P0 |
| Reviews | create/reply/duplicate/unauthorized | P0 |
| Promotions | list/redeem/redeem twice/expired | P1 |
| Account | provision/delete request/duplicate request/logout | P0 |
| Network | offline/slow/failure/retry/reconnect | P1 |
| Mobile | Android/iOS viewport/safe area/orientation/back | P0 |
| PWA | install/cache/update/offline fallback | P1 |
| Security | RLS/IDOR/RPC/role escalation/input abuse | P0 |
| Performance | cold start/reload/repeated navigation/list growth | P1 |
| Regression | modular behavior vs legacy reference demo | P0 |

P0 failures block release. P1 failures require resolution or documented risk acceptance before store submission.
