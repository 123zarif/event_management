---
trigger: always_on
description: "ClubSphere architecture and engineering constraints."
---

# ClubSphere Architecture Rules

## Stack

Use the existing project stack:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Redis
- Auth.js

Do not replace core technologies without a strong reason.

## General

Prefer simple, maintainable architecture over unnecessary abstraction.

Do not create abstractions for one-time operations.

Reuse existing components, utilities, schemas, and server actions.

Keep server and client responsibilities clear.

## Data

PostgreSQL is the source of truth.

Redis is for:

- Caching
- Short-lived locks
- Queues
- Real-time coordination
- Rate limiting where appropriate

Do not make Redis the authoritative storage layer.

## Event Model

Core hierarchy:

Organization
→ Fest
→ Event
→ Registration

Competition functionality should be optional per event.

An event may support:

- Registration
- Teams
- Submissions
- Judging
- Leaderboards
- Tournament brackets
- Check-in
- Certificates

Do not force every event to support every capability.

## Security

Validate all server-side input.

Never trust client-submitted role, organization, event ownership, registration status, scores, or capacity values.

Authorization must be enforced on the server.

Never expose secrets to the client.

## Database

Use transactions for operations that must remain consistent.

Capacity and registration state must be concurrency-safe.

Avoid race conditions when confirming registrations, promoting waitlists, or progressing competition states.

## API / Server Actions

Keep mutations on the server.

Validate input before database operations.

Return structured success/error results.

Handle expected failures gracefully.

## Type Safety

Use strict TypeScript.

Avoid `any` unless there is a documented technical reason.

Prefer shared types and schema validation.

## UI Architecture

Use shadcn/ui primitives.

Prefer reusable application-level components over duplicated page-specific components.

Keep business logic out of purely presentational components.

## Performance

Avoid unnecessary client components.

Prefer server components where possible.

Do not fetch the same data repeatedly.

Paginate potentially large participant/submission datasets.

Avoid unnecessarily expensive queries.

## Production Quality

A feature is not complete merely because the happy path works.

Handle:

- Loading
- Errors
- Empty data
- Permissions
- Duplicate actions
- Expired deadlines
- Full capacity
- Concurrent actions
- Network failures