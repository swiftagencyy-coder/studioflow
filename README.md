# StudioFlow

StudioFlow is a production-ready MVP client portal for freelancers, agencies, and design studios. It centralizes onboarding, file collection, proposals, approvals, revisions, invoice visibility, and client communication on top of Next.js 15 and Supabase.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component layer
- Supabase Postgres, Auth, Storage, and Row Level Security
- React Hook Form + Zod
- TanStack Table
- Resend-ready notification abstraction

## Product scope

- Agency owner, team member, and client roles
- Agency dashboard with active client/project metrics and recent activity
- Workspace settings with agency branding and portal messaging
- Client management with archive flow and linked records
- Project workspaces for onboarding, files, proposals, approvals, revisions, and invoices
- Client portal with project-by-project visibility
- Invite-based team and client onboarding
- Search and status filters for client and project directories
- Email notifications for onboarding requests, proposal sends, approval requests, revision submissions, and invoice updates
- Activity log for major actions

## Folder structure

```text
src/
  app/
    (auth)/
    (agency)/
    portal/
    setup/
  actions/
  components/
    dashboard/
    forms/
    layout/
    providers/
    shared/
    ui/
  lib/
    auth/
    data/
    notifications/
    storage.ts
    supabase/
    validation/
  types/
scripts/
supabase/
  config.toml
  migrations/
```

## Route map

- `/`
- `/login`
- `/register`
- `/setup`
- `/dashboard`
- `/clients`
- `/clients/[id]`
- `/projects`
- `/projects/[id]`
- `/projects/[id]/onboarding`
- `/projects/[id]/files`
- `/projects/[id]/proposal`
- `/projects/[id]/approvals`
- `/projects/[id]/revisions`
- `/projects/[id]/invoices`
- `/portal`
- `/portal/projects/[id]`
- `/portal/proposals/[id]`
- `/portal/approvals/[id]`
- `/settings`
- `/invite/[token]`

## Database and security

The schema lives in:

- `supabase/migrations/20260313224500_initial_schema.sql`
- `supabase/migrations/20260313224600_rls_and_storage.sql`
- `supabase/migrations/20260314113000_growth_features.sql`
- `supabase/migrations/20260314124500_invitation_permission_hardening.sql`

Security decisions:

- Internal-only fields are split into `client_private_details` and `project_private_details` so clients never receive those columns.
- RLS is enabled and forced on every application table.
- Storage object paths are validated against agency/project/client folder structure before access is allowed.
- Workspace invitations are stored in Postgres and accepted through a security-definer function that validates token, email, and role before creating memberships.
- Team member invitations can only be created, revoked, or mutated by the agency owner at the database policy layer.
- Client responses that should not mutate arbitrary columns use SQL RPC functions:
  - `app.respond_to_proposal`
  - `app.respond_to_approval`
  - `app.accept_workspace_invitation`
- Registration bootstrap for agency owners uses `app.bootstrap_agency_owner`.

Storage buckets:

- `project-assets`
- `deliverables`
- `onboarding-files`

## Environment variables

Copy `.env.example` into `.env.local` and fill in:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=StudioFlow <hello@example.com>
```

## Local setup with Supabase CLI

1. Install dependencies:

```bash
npm install
```

2. Install the Supabase CLI if you do not already have it.

3. Start local Supabase:

```bash
supabase start
```

4. Link your local env values from the CLI output into `.env.local`.

5. Apply migrations:

```bash
supabase db reset
```

6. Seed demo users and product data:

```bash
npm run seed
```

7. Start the app:

```bash
npm run dev
```

Demo credentials after seeding:

- `owner@studioflow.demo` / `StudioFlow123!`
- `team@studioflow.demo` / `StudioFlow123!`
- `maya@lumencoffee.demo` / `StudioFlow123!`
- `nina@atelier.demo` / `StudioFlow123!`

## Hosted Supabase setup

1. Create a hosted Supabase project.
2. In the SQL editor, run the migration files in timestamp order.
3. Confirm that Auth email/password is enabled.
4. Copy project URL, anon key, and service role key into `.env.local` or your deployment environment.
5. Run `npm run seed` against the hosted project only if you want the demo dataset.

## Deployment

### Vercel

1. Import the repo into Vercel.
2. Set the environment variables from `.env.example`.
3. Deploy.
4. In Supabase Auth, add your deployed Vercel URL to:
   - Site URL
   - Additional redirect URLs

### Other platforms

Any Node-capable host that supports Next.js App Router works. The app only requires:

- Node 20+
- Environment variables from `.env.example`
- Access to the configured Supabase project

## Notification provider

The email layer is provider-abstracted in `src/lib/notifications/index.ts`.

- If `RESEND_API_KEY` is present, email sends through Resend.
- If it is absent, notification calls no-op safely so the app still works in local development.

## Seed data

The demo script in `scripts/seed-demo.ts` creates:

- 1 agency owner
- 1 team member
- 2 client users
- 2 clients
- 3 projects
- onboarding submissions
- uploaded storage objects and database metadata
- proposals and line items
- approval requests
- revision requests
- invoices
- pending workspace invitations
- activity logs

## Assumptions

- Internal users belong to exactly one agency in the MVP.
- Client users belong to exactly one client account in the MVP.
- Billing subscriptions are still a future extension; the app is now invitation-ready for both internal teams and clients.
- Invoice tracking is status-based and Stripe-ready, not a full accounting workflow.

## Future improvements

- Stripe subscription and usage billing
- Comment threads on files and approvals
- Reusable onboarding templates
- White-label domains and custom sender branding
- Automation rules for reminders, nudges, and overdue follow-up
