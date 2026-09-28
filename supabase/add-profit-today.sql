alter table public.profiles
add column if not exists profit_today numeric(18, 2) not null default 0;