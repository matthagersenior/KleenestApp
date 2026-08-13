# Monolith → Modular Migration Inventory

This inventory is grounded in the current working monolith/reference and is used to drive extraction rather than rewriting behavior from memory.

| Legacy surface | Modular target | Status |
|---|---|---|
| LocalStorage `DB` | Supabase facade/runtime | In migration |
| Legacy login/signup handlers | centralized Supabase auth runtime | In migration |
| Legacy logout | Supabase logout event bridge | Migrated/guarded |
| Auth modal behavior | modular auth UI/touch layer | Guarded |
| Check-ins | runtime check-in API | Contracted |
| Reviews/replies | runtime review API | Contracted |
| Promotions | runtime promotion API | Contracted |
| Notifications | runtime notification API | Contracted |
| Preferred | eligibility/activation/use runtime APIs | Contracted |
| Account deletion | authenticated deletion-request RPC | Implemented |
| Business provisioning | Supabase business facade | Contracted |
| Partner access | modular partner layer | In migration |
| Legacy quick-login | demo/reference only | Must not ship to production |
| Embedded local demo credentials | demo/reference only | Must not ship to production |

## Promotion rule

Do not remove a legacy surface merely because a similarly named modular function exists. Require a user-visible workflow test, authorization test where applicable, and regression coverage before marking the surface migrated.
