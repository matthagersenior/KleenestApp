# Kleenest Mobile Readiness

## Current
- Web app has a standalone web manifest.
- Static app shell has a service worker.
- Supabase authentication remains remote and is not cached by the service worker.
- Capacitor configuration is prepared with application ID `com.kleenest.app`.

## Native packaging
1. Install the Capacitor dependencies from `capacitor.package.json` into the mobile build workspace.
2. Run `npx cap add android` and `npx cap add ios` once in the packaging workspace.
3. Run `npx cap sync` after web changes.
4. Configure signed Android release credentials in Android Studio/Gradle.
5. Configure Apple signing, bundle identifier, privacy disclosures, and App Store metadata in Xcode/App Store Connect.

## Before store submission
- Replace placeholder/empty manifest icons with production 192px and 512px icons plus maskable variants.
- Add production splash assets.
- Test auth redirects and deep links on physical Android/iOS devices.
- Test camera/location permissions and denied-permission recovery.
- Verify Supabase redirect URLs for production domains and native callback URLs.
- Run the full demo acceptance suite against a non-production demo dataset.
- Confirm RLS policies and RPC authorization in production.
