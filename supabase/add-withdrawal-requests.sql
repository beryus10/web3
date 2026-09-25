do $$
begin
  create type public.withdrawal_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(18, 2) not null check (amount > 0),
  network text not null,
  recipient_address text not null,
  currency text not null default 'USD',
  status public.withdrawal_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists withdrawal_requests_user_id_idx on public.withdrawal_requests(user_id);
create index if not exists withdrawal_requests_status_idx on public.withdrawal_requests(status);

alter table public.withdrawal_requests enable row level security;

create policy "Users can view their withdrawals"
on public.withdrawal_requests for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can create withdrawals"
on public.withdrawal_requests for insert to authenticated
with check (user_id = auth.uid());

create policy "Admins can review withdrawals"
on public.withdrawal_requests for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.review_withdrawal(request_id uuid, decision public.withdrawal_status)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  request public.withdrawal_requests;
begin
  if not public.is_admin() then
    raise exception 'admin access required';
  end if;

  select * into request
  from public.withdrawal_requests
  where id = request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'pending withdrawal not found';
  end if;

  if decision = 'approved' then
    update public.profiles
    set balance = balance - request.amount
    where id = request.user_id and balance >= request.amount;
    if not found then raise exception 'insufficient balance'; end if;
  end if;

  update public.withdrawal_requests
  set status = decision, reviewed_at = now()
  where id = request_id;
end;
$$;

grant execute on function public.review_withdrawal(uuid, public.withdrawal_status) to authenticated;
