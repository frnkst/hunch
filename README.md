# Hunch

A private, mobile-first prediction game for friends. Members sign in with
GitHub, predict future outcomes, and earn points when questions are resolved.

Built with Next.js, Supabase, Tailwind CSS, and the same visual system as
Habitz.

## Features

- GitHub OAuth with admin approval for new members
- Yes/no, multiple-choice, number, date, and date-time predictions
- Creator-set deadlines and prediction visibility
- Editable predictions until the deadline
- Creator resolution, admin override, and question cancellation
- 10/0 scoring for categorical questions
- Proportional 10-to-0 rank scoring for number and date questions, with tied
  ranks sharing their occupied points
- All-time, monthly, and yearly leaderboards

## Local setup

Requirements: Node.js 22 or newer, npm, and a Supabase project.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in every value. Find your
   immutable numeric GitHub ID through the GitHub API, not your username.

3. Apply the database migration:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

4. In Supabase Authentication, enable GitHub and configure a GitHub OAuth App.
   Use Supabase's provider callback URL:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

5. Add the application callback URLs in Supabase URL Configuration:

   ```text
   http://localhost:3000/auth/callback
   https://hunch.void0.ch/auth/callback
   ```

6. Start the app:

   ```bash
   npm run dev
   ```

The GitHub account matching `ADMIN_GITHUB_USER_ID` is approved automatically.
All other accounts remain isolated on the pending screen until approved by the
admin.

## Vercel

Add every variable from `.env.example` to the Vercel project and set
`APP_URL=https://hunch.void0.ch`. Never expose
`SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
