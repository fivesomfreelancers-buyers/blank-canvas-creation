# Secure FIVESOM authentication and onboarding redesign

## What will change

- Turn **Join FIVESOM** into the new-user entry point: first show two clear, animated choices for **Freelancer** and **Buyer**.
- Build a guided split-screen experience using the selected **FIVESOM Dark + Cyan** palette and **Sora + Manrope** typography.
- Keep **Sign In** completely separate: Google or email/password only, with existing buyers and freelancers sent directly to their saved dashboard.
- Replace the competing registration paths with one shared, role-aware signup system while preserving the existing public URLs.

## New-user flow

- `/register` shows the role choice before any account form.
- `/register/freelancer` shows Google first, then an email form with name, country, professional title, skills/category, professional introduction, password, and required legal agreement.
- `/register/buyer` shows Google first, then a shorter email form with name, country, industry/hiring context, password, and required legal agreement.
- Email signup stores only pending onboarding information until the email is verified; verification then completes the account securely and sends the user to the correct dashboard.
- Google signup returns to the selected role form, prefills trusted Google name/email, and requires all remaining fields before the role is created.
- No Skip, Maybe later, or dashboard bypass will exist.

## Security and existing accounts

- Change new-account creation so auth metadata can never directly grant Buyer or Freelancer access before verification.
- Add one database operation that validates the authenticated user, confirmed email, allowed role, and required role-specific fields before creating the role record and role profile together.
- Keep current users, gigs, orders, profiles, and valid roles unchanged.
- Existing configured users never see role selection during login.
- Keep dashboard route checks, and extend backend rules so an incomplete account cannot create role-specific records by calling the API directly.
- Neutral legacy members may choose a role and complete the same required onboarding after authentication.

## Interface details

- Shared branded auth shell with a concise trust/benefit panel and focused form panel.
- Official Google icon, clear OR divider, accessible labels, inline validation, password visibility control, and terms/privacy links.
- Subtle staggered entrance, hover lift, selected-state ring, icon movement, and reduced-motion support.
- One-column mobile layout with stable spacing and touch-friendly controls.

## Verification

- Test role choice, email signup, verification return, email login, Google return behavior, existing buyer/freelancer routing, incomplete-account route protection, refresh/direct URLs, and desktop/mobile layouts.
- Confirm build health and inspect the applied database rules. Google OAuth completion will be reported separately if an external provider interaction cannot be fully automated.
