create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('user', 'admin')),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists support_messages_user_created_idx
on public.support_messages(user_id, created_at);

alter table public.support_messages enable row level security;

drop policy if exists "Users and admins can view support messages" on public.support_messages;
create policy "Users and admins can view support messages"
on public.support_messages for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can start support messages" on public.support_messages;
create policy "Users can start support messages"
on public.support_messages for insert to authenticated
with check (user_id = auth.uid() and sender_role = 'user');

drop policy if exists "Admins can reply to support messages" on public.support_messages;
create policy "Admins can reply to support messages"
on public.support_messages for insert to authenticated
with check (public.is_admin() and sender_role = 'admin');
