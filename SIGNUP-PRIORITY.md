# Signup release gate

GitHub Pages currently serves `main`. The refactor branch must pass the Profile → Log in/Sign up → Sign Up flow before release.

Required path:

1. Open Profile.
2. Open Log in / Sign up.
3. Select Sign Up.
4. Clicking any signup field must keep the modal open.
5. Submit a valid signup.
6. Create the Supabase Auth user and profile.
7. Handle confirmation-required accounts without assuming a session.

This file is a temporary release-gate marker for the Pages transition and should be removed after the verified refactor is published.