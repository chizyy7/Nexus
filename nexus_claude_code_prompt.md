# Nexus — Math Learning App
## Claude Code Build Prompt

---

## Project overview

Build **Nexus**, a web application that helps university students understand mathematical concepts through active problem solving, spaced repetition, and AI tutoring. Think of it as Anki meets a math tutor — problems surface at the right time, and when you're stuck, an AI explains the concept rather than just giving the answer.

This is an MVP for a 200-person early access waitlist. Build it to be production-ready and deployable to Vercel on day one.

---

## Tech stack

Use exactly this stack — do not deviate:

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript throughout — no `any` types
- **Database:** PostgreSQL via **Supabase** (use Supabase client, not raw pg)
- **ORM:** Prisma
- **Auth:** **NextAuth.js v5** — email/password (credentials provider) + Google OAuth provider
- **AI:** Anthropic Claude API via `@anthropic-ai/sdk` — use `claude-sonnet-4-5` model
- **Styling:** Tailwind CSS + **shadcn/ui** components
- **Math rendering:** **KaTeX** via `react-katex` for all LaTeX in problems and AI responses
- **Spaced repetition:** Implement the **SM-2 algorithm** from scratch (no library)
- **Deployment:** Vercel — include `vercel.json` and confirm all environment variables are documented

---

## Database schema

Design and implement Prisma schema with these models. Run `prisma migrate dev` to apply.

```
User
  id, email, name, image, emailVerified
  passwordHash (nullable — null for OAuth users)
  createdAt, updatedAt

Account (NextAuth adapter table)
  — standard NextAuth fields

Session (NextAuth adapter table)
  — standard NextAuth fields

Topic
  id, name, slug
  description
  parentId (self-relation for subtopics)
  order (integer for display ordering)

Problem
  id
  topicId (FK → Topic)
  title
  body (LaTeX string — the full problem statement)
  solution (LaTeX string)
  difficulty: enum EASY | MEDIUM | HARD
  createdAt

UserProblem (spaced repetition state per user per problem)
  id
  userId (FK → User)
  problemId (FK → Problem)
  easeFactor (Float, default 2.5)
  interval (Int, days until next review, default 1)
  repetitions (Int, default 0)
  nextReviewAt (DateTime)
  lastReviewedAt (DateTime, nullable)
  status: enum NEW | LEARNING | REVIEW | MASTERED

ChatSession
  id
  userId (FK → User)
  problemId (FK → Problem, nullable — chat can be about a problem or freeform)
  title (auto-generated from first message)
  createdAt

ChatMessage
  id
  sessionId (FK → ChatSession)
  role: enum USER | ASSISTANT
  content (Text)
  createdAt
```

Seed the database with:
- 5 top-level topics: Calculus, Linear Algebra, Statistics, Discrete Mathematics, Real Analysis
- 3–5 subtopics per topic
- At least 5 problems per subtopic with real, well-formed LaTeX problem bodies and solutions

---

## Authentication

Implement with NextAuth.js v5 using the Prisma adapter.

**Credentials provider:**
- Registration: name, email, password → hash with bcrypt (12 rounds) → store in User.passwordHash
- Login: verify email + bcrypt compare
- Validate with Zod on both client and server

**Google OAuth provider:**
- Standard OAuth flow
- On first Google login, create User record with null passwordHash

**Route protection:**
- All `/app/*` routes require auth — redirect to `/login` if unauthenticated
- Use Next.js middleware (`middleware.ts`) for route protection, not per-page checks
- The marketing page (`/`) and auth pages (`/login`, `/register`) are public

---

## Pages and routes

### Public routes

**`/` — Landing page**
- Hero: "Master Mathematics Through Problems" 
- Brief explanation of spaced repetition + AI tutor concept
- CTA button: "Join Early Access" → `/register`
- Simple, clean design — not a full marketing site

**`/login` — Login page**
- Email/password form
- "Continue with Google" button
- Link to `/register`

**`/register` — Register page**
- Name, email, password fields
- "Continue with Google" button
- Zod validation, inline error messages

### App routes (auth required, layout with sidebar nav)

**`/app/dashboard` — Home**

Display three sections:
1. **Due for review** — problems where `nextReviewAt <= now`, sorted by overdue time. Show up to 10. Each card shows topic, difficulty badge, and a "Review now" button.
2. **Recent topics** — last 3 topics the user has interacted with
3. **Stats row** — total problems seen, current streak (days), mastery percentage (MASTERED / total assigned)

**`/app/topics` — Topic browser**

Tree view of all topics and subtopics. Each topic shows a progress bar (problems mastered / total problems in topic). Clicking a topic goes to `/app/topics/[slug]`.

**`/app/topics/[slug]` — Topic detail**

- Topic name and description
- List of all problems in this topic
- Each problem row: title, difficulty badge, status badge (NEW / LEARNING / REVIEW / MASTERED), next review date
- "Start studying" button → goes to the next due problem in this topic, or the first NEW problem if none are due

**`/app/study/[problemId]` — Study / review screen**

This is the core screen. Layout:

Left panel (60% width):
- Problem title and topic breadcrumb
- Problem body rendered with KaTeX
- "Show solution" toggle — hidden by default, reveals solution (also KaTeX rendered)
- Once solution is shown, display 4 rating buttons: **Again** (0) / **Hard** (1) / **Good** (3) / **Easy** (5)
- On rating, run SM-2 algorithm, update UserProblem, then auto-advance to the next due problem or return to dashboard

Right panel (40% width):
- AI tutor chat interface
- The chat is scoped to this problem — system prompt includes the full problem context
- Input at bottom, messages scrollable above
- Messages render markdown + KaTeX (AI responses may contain LaTeX)
- "New chat" button clears history for this problem

**`/app/chat` — Freeform AI chat**

- Same chat UI as the right panel above but full-width
- No problem context — general math assistant
- Chat history persisted in DB, listed in a left sidebar as past sessions

---

## SM-2 Algorithm

Implement this exactly as a pure TypeScript function — no library.

```typescript
// lib/sm2.ts

export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2State {
  easeFactor: number;   // EF, starts at 2.5
  interval: number;     // days
  repetitions: number;  // consecutive successful reviews
}

export interface SM2Result extends SM2State {
  nextReviewAt: Date;
}

export function calculateSM2(state: SM2State, rating: Rating): SM2Result {
  // If rating < 3 (failed recall), reset repetitions and interval
  // Otherwise apply standard SM-2 formula:
  //   new EF = EF + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  //   EF floor is 1.3
  //   interval: rep=1 → 1 day, rep=2 → 6 days, rep>2 → interval * EF
  //   nextReviewAt = now + interval days
  // Return full updated state + nextReviewAt
}
```

Implement the full function body. Write unit tests for it in `__tests__/sm2.test.ts` covering: first review at each rating, failed review resetting state, EF floor clamping, interval progression over multiple Good reviews.

---

## AI tutor

**Model:** `claude-sonnet-4-5` via `@anthropic-ai/sdk`

**API route:** `POST /api/chat`

Request body:
```typescript
{
  message: string,
  sessionId: string | null,   // null = start new session
  problemId: string | null    // null = freeform chat
}
```

Response: **streaming** — use the Anthropic SDK's streaming API and return a `ReadableStream` so the UI streams tokens in real time.

**System prompt for problem-scoped chat:**
```
You are a math tutor helping a university student understand a problem.

Problem:
{problem.body}

Solution (do not reveal unless the student explicitly asks for it):
{problem.solution}

Your role:
- Guide the student toward understanding, not just the answer
- Ask Socratic questions when they're stuck
- Explain the underlying concept when needed
- Use LaTeX for all mathematical notation, wrapped in $...$ for inline and $$...$$ for display
- Be concise — this is a chat interface, not an essay
- If the student asks to just see the solution, you may show it
```

**System prompt for freeform chat:**
```
You are a helpful mathematics assistant for university students.
Use LaTeX for all mathematical notation wrapped in $...$ for inline and $$...$$ for display math.
Be clear, rigorous, and concise.
```

Auto-generate a session title from the first user message using a separate Claude call (non-streaming, max 10 words, plain text, no quotes).

**Save all messages** to the DB (ChatMessage table) after each exchange.

---

## API routes

Implement these under `app/api/`:

```
POST   /api/auth/[...nextauth]     — NextAuth handler
POST   /api/chat                   — Streaming AI chat (described above)
GET    /api/problems/due           — Returns problems due for review for current user
POST   /api/problems/[id]/review   — Submit SM-2 rating, update UserProblem
POST   /api/problems/[id]/start    — Create UserProblem record (status=LEARNING) if not exists
GET    /api/topics                 — All topics with subtopics and user progress
GET    /api/dashboard/stats        — Streak, total seen, mastery % for current user
```

All routes must:
- Return proper HTTP status codes
- Validate request bodies with Zod
- Return typed JSON responses
- Handle errors gracefully — never expose stack traces to client

---

## Streak calculation

In `/api/dashboard/stats`:
- A day counts toward the streak if the user reviewed at least one problem that day
- Calculate from `UserProblem.lastReviewedAt` timestamps
- Streak resets if no review was done yesterday (relative to server time UTC)

---

## KaTeX rendering

Create a reusable component `components/MathRenderer.tsx`:
- Accepts a `content` string that may contain inline `$...$` and display `$$...$$` LaTeX
- Parses the string, splits on LaTeX delimiters, renders math portions with `react-katex`, renders text portions as plain text
- Handles errors gracefully — if KaTeX can't parse an expression, show the raw string
- Use this component everywhere: problem body, problem solution, AI chat messages

---

## Environment variables

Document all required env vars in `.env.example`. The app must not start without them — validate their presence at startup in `lib/env.ts` using Zod.

Required vars:
```
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# Supabase (for direct client use if needed)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Vercel deployment

- Include `vercel.json` at root — configure build command and output directory
- Ensure Prisma generates correctly on Vercel by adding `postinstall: prisma generate` to `package.json`
- All environment variables listed in `.env.example` must be added to Vercel project settings before deploy
- The app must pass `next build` with zero TypeScript errors and zero ESLint errors before you consider it done

---

## File structure

Organise the project like this:

```
nexus/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          ← sidebar nav layout
│   │   ├── dashboard/page.tsx
│   │   ├── topics/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── study/
│   │   │   └── [problemId]/page.tsx
│   │   └── chat/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── chat/route.ts
│   │   ├── problems/
│   │   │   ├── due/route.ts
│   │   │   └── [id]/
│   │   │       ├── review/route.ts
│   │   │       └── start/route.ts
│   │   ├── topics/route.ts
│   │   └── dashboard/stats/route.ts
│   ├── layout.tsx              ← root layout, fonts, providers
│   └── page.tsx                ← landing page
├── components/
│   ├── ui/                     ← shadcn components (auto-generated)
│   ├── MathRenderer.tsx
│   ├── ChatInterface.tsx
│   ├── ProblemCard.tsx
│   ├── TopicTree.tsx
│   └── StatsRow.tsx
├── lib/
│   ├── sm2.ts
│   ├── env.ts
│   ├── auth.ts                 ← NextAuth config
│   ├── prisma.ts               ← Prisma client singleton
│   └── anthropic.ts            ← Anthropic client singleton
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── __tests__/
│   └── sm2.test.ts
├── middleware.ts
├── .env.example
├── vercel.json
└── package.json
```

---

## Build order

Work through this sequence — do not skip ahead:

1. Initialise Next.js 14 project with TypeScript, Tailwind, ESLint
2. Install all dependencies
3. Set up Prisma schema and run initial migration
4. Implement `lib/env.ts` validation — app must fail fast on missing vars
5. Implement SM-2 algorithm + write tests — run them and confirm passing
6. Set up NextAuth with both providers and Prisma adapter
7. Build auth pages (login, register) with validation
8. Implement middleware for route protection
9. Seed database with topics, subtopics, problems
10. Build API routes (start with `/api/problems/due` and `/api/problems/[id]/review`)
11. Build `/api/chat` with streaming
12. Build `MathRenderer` component — test it renders a sample problem correctly
13. Build `ChatInterface` component with streaming support
14. Build all app pages in order: dashboard → topics → study screen → chat
15. Build landing page
16. Run `next build` — fix all TypeScript and ESLint errors
17. Confirm `vercel.json` is correct and all env vars documented

---

## Quality requirements

- Zero TypeScript errors (`tsc --noEmit` must pass)
- Zero ESLint errors
- All API routes handle errors and never crash the server
- No `console.log` left in production code — use `console.error` only for actual errors
- The SM-2 tests must pass
- The app must be fully functional with just the env vars filled in — no manual DB setup beyond running `prisma migrate dev && prisma db seed`
