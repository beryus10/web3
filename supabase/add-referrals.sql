alter table public.profiles
add column if not exists referred_by uuid references public.profiles(id) on delete set null;

create index if not exists profiles_referred_by_idx on public.profiles(referred_by);

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
