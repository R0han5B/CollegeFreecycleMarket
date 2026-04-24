# College Freecycling Market

A campus marketplace for RKNEC students and staff to post, browse, save, and message about items inside one community-only app.

## Features

- Email + OTP based signup and login
- Post, browse, filter, and manage listings
- Fast search across title, description, and hidden item tags
- AI-assisted tag suggestions while posting or editing items
- Edit your own listing details, price, photos, and search tags
- Save items to a watchlist
- Real-time buyer/seller messaging with Pusher
- Image upload support
- AI helper bubble for marketplace guidance

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- MongoDB
- Zustand
- Pusher Channels

## Environment Variables

Create a `.env` file with the values your local setup needs:

```env
DATABASE_URL=your_mongodb_connection_string

CLOUDINARY_URL=your_cloudinary_url

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=College Freecycling Market <noreply@example.com>

OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=qwen/qwen3-next-80b-a3b-instruct:free

NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
```

Notes:

- Do not wrap env values in quotes unless they are actually needed.
- If a free OpenRouter model is rate-limited, switch `OPENROUTER_MODEL` to another model.
- If Pusher env vars are missing, messaging falls back to periodic polling instead of true realtime updates.

## Getting Started

Install dependencies:

```bash
npm install
```

Generate Prisma client and sync the database:

```bash
npm run db:generate
npm run db:push
```

Start the app:

```bash
npm run dev
```

The app runs on:

```text
http://localhost:3000
```

## Dev Notes

- Realtime messaging uses Pusher, so you do not need a custom websocket server.
- Without Pusher credentials, chat and inbox updates still refresh automatically using short polling.
- Search does not call AI live. AI is used during item create/edit to recommend hidden search tags.
- Hidden tags improve matching for related terms without exposing those tags on listing cards.
- `npm run dev` runs a normal Next.js dev server on `localhost:3000`.
- The dev script uses a separate `.next-dev` cache folder.

## Project Structure

```text
src/
  app/          pages and API routes
  components/   UI, layout, marketplace, chat, assistant
  hooks/        custom hooks
  lib/          utilities and shared server logic
prisma/         schema and seed files
public/         static assets
```

## Scripts

```bash
npm run dev        # dev server on localhost:3000
npm run build      # production build
npm run start      # production Next server
npm run lint       # eslint
npm run db:generate
npm run db:push
```
