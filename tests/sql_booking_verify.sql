-- Run after sql_bootstrap.sql and all migrations in a disposable local database.
grant usage on schema auth to authenticated;

insert into auth.users(id, email) values
  ('11111111-1111-4111-8111-111111111111', 'customer@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'seller@example.com');

insert into public.businesses(id, owner_id, slug, name, category, area, address, description, lat, lng, status)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'live-shop', 'Live Shop', 'Salon', 'Jakarta Selatan', 'Test Street 1', 'A real test shop', -6.2, 106.8, 'published'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'draft-shop', 'Draft Shop', 'Salon', 'Jakarta Selatan', 'Test Street 2', 'A draft test shop', -6.2, 106.8, 'draft');

insert into public.services(id, business_id, name, duration_minutes, price_idr) values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Haircut', 60, 100000),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Color', 90, 200000);

insert into public.weekly_hours(business_id, day_of_week, opens_at, closes_at)
select 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', day, '09:00', '18:00'
from generate_series(0, 6) day;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$ begin
  if (select count(*) from public.businesses) <> 1 then raise exception 'Unpublished business leaked'; end if;
  begin
    perform public.create_booking(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      ((now() at time zone 'Asia/Jakarta')::date + interval '2 days 10 hours') at time zone 'Asia/Jakarta',
      'Customer Test'
    );
    raise exception 'Launch gate failed open';
  exception when sqlstate 'P0001' then null;
  end;
end $$;

reset role;
update public.platform_settings set enabled = true where key = 'bookings_open';
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select public.create_booking(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  ((now() at time zone 'Asia/Jakarta')::date + interval '2 days 10 hours') at time zone 'Asia/Jakarta',
  'Customer Test'
);

do $$ begin
  begin
    perform public.create_booking(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      ((now() at time zone 'Asia/Jakarta')::date + interval '2 days 10 hours 30 minutes') at time zone 'Asia/Jakarta',
      'Customer Test'
    );
    raise exception 'Overlapping request was accepted';
  exception when exclusion_violation then null;
  end;
  if (select count(*) from public.bookings) <> 1 then raise exception 'Expected exactly one booking'; end if;
end $$;

set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
do $$ begin
  if (select count(*) from public.businesses) <> 2 then raise exception 'Seller cannot see own draft'; end if;
  if (select count(*) from public.bookings) <> 1 then raise exception 'Seller cannot see own booking'; end if;
end $$;
