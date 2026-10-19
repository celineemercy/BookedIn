-- A booking and a schedule edit lock the same business row before validating.
-- This closes the gap between the application availability check and the write.
create function public.guard_booking_schedule() returns trigger
language plpgsql security definer set search_path = public as $$
declare shop_status text; opening public.weekly_hours%rowtype;
  local_start timestamp; local_end timestamp;
begin
  select status into shop_status from public.businesses where id = new.business_id for update;
  if shop_status is distinct from 'published' then raise exception 'Business unavailable'; end if;
  if new.starts_at < now() + interval '2 hours' or new.starts_at > now() + interval '30 days' then
    raise exception 'Time outside booking window';
  end if;
  local_start := new.starts_at at time zone 'Asia/Jakarta';
  local_end := new.ends_at at time zone 'Asia/Jakarta';
  select * into opening from public.weekly_hours
  where business_id = new.business_id and day_of_week = extract(dow from local_start)::integer;
  if not found or opening.opens_at is null or local_start::time < opening.opens_at
    or local_end::date <> local_start::date or local_end::time > opening.closes_at then
    raise exception 'Outside opening hours';
  end if;
  if exists (select 1 from public.date_blocks where business_id = new.business_id and blocked_date = local_start::date) then
    raise exception 'Date unavailable';
  end if;
  return new;
end;
$$;
create trigger booking_schedule_guard before insert on public.bookings
for each row execute function public.guard_booking_schedule();
revoke execute on function public.guard_booking_schedule() from public, anon, authenticated;

create function public.guard_weekly_hours() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform 1 from public.businesses where id = new.business_id for update;
  if exists (
    select 1 from public.bookings b
    where b.business_id = new.business_id and b.status in ('pending', 'accepted') and b.ends_at > now()
      and extract(dow from b.starts_at at time zone 'Asia/Jakarta')::integer = new.day_of_week
      and (
        new.opens_at is null
        or (b.starts_at at time zone 'Asia/Jakarta')::time < new.opens_at
        or (b.ends_at at time zone 'Asia/Jakarta')::time > new.closes_at
      )
  ) then raise exception 'Hours conflict with active bookings'; end if;
  return new;
end;
$$;
create trigger weekly_hours_booking_guard before insert or update on public.weekly_hours
for each row execute function public.guard_weekly_hours();
revoke execute on function public.guard_weekly_hours() from public, anon, authenticated;

create function public.guard_date_block() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform 1 from public.businesses where id = new.business_id for update;
  if exists (
    select 1 from public.bookings b
    where b.business_id = new.business_id and b.status in ('pending', 'accepted')
      and (b.starts_at at time zone 'Asia/Jakarta')::date = new.blocked_date
  ) then raise exception 'Date conflicts with active bookings'; end if;
  return new;
end;
$$;
create trigger date_block_booking_guard before insert or update on public.date_blocks
for each row execute function public.guard_date_block();
revoke execute on function public.guard_date_block() from public, anon, authenticated;
