-- Create a function to reject/cancel a deposit request
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

grant execute on function public.reject_deposit(uuid) to authenticated;
