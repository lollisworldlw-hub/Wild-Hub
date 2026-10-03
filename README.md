# WiLD Hub

Alliance hub for WiLD (React + Vite, Supabase database, hosted on Netlify).

**Features:** Canyon Storm & Desert Storm sign-ups, team assignments and battle plans, member / R4 / admin roles with approvals, weekly VS goal (PUSH/SAVE), trains (conductor, guardian, weekly goal), calculators.

## Setup
1. **Supabase:** create a project, then open SQL Editor and run `supabase-setup.sql`.
2. Paste your Project URL and publishable (anon) key into `src/supabase.js`.
3. **GitHub:** push this folder to a new repo.
4. **Netlify:** import the repo. Build settings come from `netlify.toml` (`npm run build` → `dist`).
5. Create your account on the live site, then make yourself admin in Supabase → SQL Editor:
   ```sql
   update members set role = 'admin', approved = true where username ilike 'YourName';
   ```

## Things you may want to edit
- Battle plan text: `CS_PLAN`, `CS_NOTES`, `DS_PLAN` and `DS_NOTES` in `src/App.jsx`
- Colors: the `:root` and `body.dark` blocks near the top of the CSS in `src/App.jsx`
- Logo: `public/wild-logo.jpg` and the `icon-*.png` files
