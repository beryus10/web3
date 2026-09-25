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
