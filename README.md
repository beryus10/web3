This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Supabase setup

The authentication and account workflows use Supabase Auth and Postgres.

1. Keep these values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

2. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). If the schema was already installed, run [`supabase/add-withdrawal-requests.sql`](supabase/add-withdrawal-requests.sql), [`supabase/review-withdrawals.sql`](supabase/review-withdrawals.sql), and [`supabase/fix-duplicate-deposits.sql`](supabase/fix-duplicate-deposits.sql).
	If you already ran an earlier version, also run `alter table public.profiles add column if not exists phone text not null default '';`.
3. Create an account through `/login?mode=signup`.
4. Promote the first admin from the Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

Admins sign in at `/console/admin/login`. They can review pending deposits and adjust user balances. Client deposits remain pending until an admin approves them.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
