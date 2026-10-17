create table public.platform_settings (
  key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.platform_settings(key, enabled) values ('bookings_open', false);
alter table public.platform_settings enable row level security;
revoke all on public.platform_settings from anon, authenticated;

create function public.enforce_booking_launch_gate() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.platform_settings
    where key = 'bookings_open' and enabled
  ) then
    raise exception 'Booking is not open' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger booking_launch_gate before insert on public.bookings
for each row execute function public.enforce_booking_launch_gate();
revoke execute on function public.enforce_booking_launch_gate() from public, anon, authenticated;
