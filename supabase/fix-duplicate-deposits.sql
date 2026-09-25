-- Replace the approval function so it updates the existing deposit request
-- and user balance without creating a second history transaction.
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

grant execute on function public.approve_deposit(uuid) to authenticated;

-- Optional cleanup for old approval rows already shown as duplicate adjustments.
-- Review these rows before running the delete in production.
-- select id, user_id, amount, description
-- from public.balance_transactions
-- where description ilike '%deposit approved%';
-- delete from public.balance_transactions
-- where description ilike '%deposit approved%';
