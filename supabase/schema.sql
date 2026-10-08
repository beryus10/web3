create type public.user_role as enum ('user', 'admin');
create type public.deposit_status as enum ('pending', 'approved', 'rejected');
create type public.withdrawal_status as enum ('pending', 'approved', 'rejected');
create type public.transaction_type as enum ('deposit', 'withdrawal', 'adjustment');
create type public.transaction_status as enum ('pending', 'completed', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  referred_by uuid references public.profiles(id) on delete set null,
  role public.user_role not null default 'user',
  balance numeric(18, 2) not null default 0 check (balance >= 0),
  active_investment numeric(18, 2) not null default 0 check (active_investment >= 0),
  profit_today numeric(18, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.deposit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(18, 2) not null check (amount > 0),
  network text not null,
  status public.deposit_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.withdrawal_requests (
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

create table public.balance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(18, 2) not null,
  status public.transaction_status not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('user', 'admin')),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index deposit_requests_user_id_idx on public.deposit_requests(user_id);
create index deposit_requests_status_idx on public.deposit_requests(status);
create index withdrawal_requests_user_id_idx on public.withdrawal_requests(user_id);
create index withdrawal_requests_status_idx on public.withdrawal_requests(status);
create index balance_transactions_user_id_idx on public.balance_transactions(user_id);
create index support_messages_user_created_idx on public.support_messages(user_id, created_at);
create index profiles_referred_by_idx on public.profiles(referred_by);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  inviter_id uuid;
  inviter_value text;
begin
  inviter_value := new.raw_user_meta_data ->> 'invited_by';
  if inviter_value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    inviter_id := inviter_value::uuid;
    if inviter_id = new.id or not exists (
      select 1 from public.profiles where id = inviter_id and role = 'user'
    ) then
      inviter_id := null;
    end if;
  end if;

  insert into public.profiles (id, email, full_name, referred_by)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    inviter_id
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.deposit_requests enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.balance_transactions enable row level security;
alter table public.support_messages enable row level security;

create policy "Users can view their own profile"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can update profiles"
on public.profiles for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can view their deposits"
on public.deposit_requests for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can create deposits"
on public.deposit_requests for insert to authenticated
with check (user_id = auth.uid());

create policy "Admins can review deposits"
on public.deposit_requests for update to authenticated
using (public.is_admin())
with check (public.is_admin());

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

create policy "Users can view their transactions"
on public.balance_transactions for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users and admins can view support messages"
on public.support_messages for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can start support messages"
on public.support_messages for insert to authenticated
with check (user_id = auth.uid() and sender_role = 'user');

create policy "Admins can reply to support messages"
on public.support_messages for insert to authenticated
with check (public.is_admin() and sender_role = 'admin');

create or replace function public.adjust_user_balance(
  target_user_id uuid,
  amount_delta numeric,
  note text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required';
  end if;

  update public.profiles
  set balance = balance + amount_delta
  where id = target_user_id and balance + amount_delta >= 0;

  if not found then
    raise exception 'user not found or balance cannot be negative';
  end if;

  insert into public.balance_transactions (user_id, type, amount, status, description)
  values (target_user_id, 'adjustment', amount_delta, 'completed', note);
end;
$$;

create or replace function public.approve_deposit(request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  request public.deposit_requests;
begin
  if not public.is_admin() then
    raise exception 'admin access required';
  end if;

  select * into request
  from public.deposit_requests
  where id = request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'pending deposit not found';
  end if;

  update public.deposit_requests
  set status = 'approved', reviewed_at = now()
  where id = request_id;

  update public.profiles
  set balance = balance + request.amount
  where id = request.user_id;
end;
$$;

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

    if not found then
      raise exception 'insufficient balance';
    end if;
  end if;

  update public.withdrawal_requests
  set status = decision, reviewed_at = now()
  where id = request_id;
end;
$$;

create or replace function public.reject_deposit(request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required';
  end if;

  update public.deposit_requests
  set status = 'rejected', reviewed_at = now()
  where id = request_id and status = 'pending';

  if not found then
    raise exception 'pending deposit not found';
  end if;
end;
$$;

grant execute on function public.adjust_user_balance(uuid, numeric, text) to authenticated;
grant execute on function public.approve_deposit(uuid) to authenticated;
grant execute on function public.reject_deposit(uuid) to authenticated;
grant execute on function public.review_withdrawal(uuid, public.withdrawal_status) to authenticated;
