-- Run after sql_booking_verify.sql and the concurrent booking test.
-- The transaction leaves the disposable database unchanged.
begin;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select public.create_booking(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  ((now() at time zone 'Asia/Jakarta')::date + interval '4 days 10 hours') at time zone 'Asia/Jakarta',
  'Schedule Test'
);
reset role;

do $$
declare booking_date date := (now() at time zone 'Asia/Jakarta')::date + 4;
  booking_day integer := extract(dow from (now() at time zone 'Asia/Jakarta')::date + 4)::integer;
  blocked boolean;
begin
  blocked := false;
  begin
    update public.weekly_hours set closes_at = '10:30'
    where business_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and day_of_week = booking_day;
  exception when others then
    if sqlerrm <> 'Hours conflict with active bookings' then raise; end if;
    blocked := true;
  end;
  if not blocked then raise exception 'Conflicting hours were accepted'; end if;

  blocked := false;
  begin
    insert into public.date_blocks(business_id, blocked_date)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', booking_date);
  exception when others then
    if sqlerrm <> 'Date conflicts with active bookings' then raise; end if;
    blocked := true;
  end;
  if not blocked then raise exception 'Conflicting date closure was accepted'; end if;

  if (select closes_at from public.weekly_hours where business_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and day_of_week = booking_day) <> '18:00' then
    raise exception 'Hours changed despite conflict';
  end if;
end $$;

insert into public.date_blocks(business_id, blocked_date)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', (now() at time zone 'Asia/Jakarta')::date + 5);

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
do $$
declare blocked boolean := false;
begin
  begin
    perform public.create_booking(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      ((now() at time zone 'Asia/Jakarta')::date + interval '5 days 10 hours') at time zone 'Asia/Jakarta',
      'Schedule Test'
    );
  exception when others then
    if sqlerrm <> 'Date unavailable' then raise; end if;
    blocked := true;
  end;
  if not blocked then raise exception 'Booking on a closed date was accepted'; end if;
end $$;
rollback;
