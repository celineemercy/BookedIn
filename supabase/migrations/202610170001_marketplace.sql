create extension if not exists btree_gist;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create function public.create_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile();
insert into public.profiles(id, display_name)
select id, coalesce(raw_user_meta_data ->> 'display_name', '') from auth.users
on conflict (id) do nothing;

create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and is_admin);
$$;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('Salon', 'Barbershop', 'Nail Studio', 'Spa')),
  area text not null,
  address text not null,
  description text not null default '',
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  cover_url text,
  gallery_urls text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index businesses_owner_idx on public.businesses(owner_id);
create index businesses_public_idx on public.businesses(status, category, area);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  duration_minutes integer not null check (duration_minutes between 15 and 480 and duration_minutes % 15 = 0),
  price_idr integer not null check (price_idr >= 1000),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index services_business_idx on public.services(business_id);

create table public.weekly_hours (
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  primary key (business_id, day_of_week),
  check ((opens_at is null and closes_at is null) or (opens_at is not null and closes_at is not null and opens_at < closes_at))
);

create table public.date_blocks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  blocked_date date not null,
  reason text,
  unique (business_id, blocked_date)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  service_id uuid not null references public.services(id),
  customer_id uuid not null references auth.users(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  service_name text not null,
  duration_minutes integer not null,
  price_idr integer not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  expires_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired', 'cancelled_by_customer', 'cancelled_by_seller', 'completed')),
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  constraint bookings_no_overlap exclude using gist (
    business_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'accepted'))
);
create index bookings_customer_idx on public.bookings(customer_id, starts_at desc);
create index bookings_business_idx on public.bookings(business_id, starts_at);
create index bookings_expiry_idx on public.bookings(expires_at) where status = 'pending';

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id),
  business_id uuid not null references public.businesses(id),
  customer_id uuid not null references auth.users(id),
  rating integer not null check (rating between 1 and 5),
  body text not null default '',
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index reviews_business_idx on public.reviews(business_id, visible);

create table public.favorites (
  customer_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, business_id)
);

create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  recipient_email text not null,
  event text not null,
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index email_outbox_ready_idx on public.email_outbox(next_attempt_at) where sent_at is null;

create table public.product_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  anonymous_session text,
  business_id uuid,
  created_at timestamptz not null default now()
);

create function public.enqueue_booking_emails() returns trigger language plpgsql security definer set search_path = public as $$
declare seller_email text;
begin
  if tg_op = 'UPDATE' and new.status = old.status then return new; end if;
  select u.email into seller_email from public.businesses b join auth.users u on u.id = b.owner_id where b.id = new.business_id;
  if seller_email is not null then
    insert into public.email_outbox(booking_id, recipient_email, event) values (new.id, seller_email, 'seller_' || new.status);
  end if;
  insert into public.email_outbox(booking_id, recipient_email, event) values (new.id, new.customer_email, 'customer_' || new.status);
  return new;
end;
$$;
create trigger booking_email_created after insert on public.bookings for each row execute function public.enqueue_booking_emails();
create trigger booking_email_changed after update of status on public.bookings for each row execute function public.enqueue_booking_emails();

create function public.expire_bookings() returns integer language plpgsql security definer set search_path = public as $$
declare changed integer;
begin
  update public.bookings set status = 'expired', updated_at = now()
  where status = 'pending' and expires_at <= now();
  get diagnostics changed = row_count;
  return changed;
end;
$$;

create function public.create_booking(
  p_business_id uuid, p_service_id uuid, p_starts_at timestamptz,
  p_customer_name text, p_customer_phone text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare b public.businesses%rowtype; s public.services%rowtype; h public.weekly_hours%rowtype;
  local_start timestamp; local_end timestamp; booking_id uuid; customer_email text;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '28000'; end if;
  if length(trim(p_customer_name)) < 2 or length(trim(p_customer_name)) > 80 then raise exception 'Invalid customer name'; end if;
  if p_starts_at < now() + interval '2 hours' or p_starts_at > now() + interval '30 days' then raise exception 'Time outside booking window'; end if;
  local_start := p_starts_at at time zone 'Asia/Jakarta';
  if extract(minute from local_start)::integer % 15 <> 0 or extract(second from local_start) <> 0 then raise exception 'Invalid time increment'; end if;
  select * into b from public.businesses where id = p_business_id and status = 'published';
  if not found then raise exception 'Business unavailable'; end if;
  select * into s from public.services where id = p_service_id and business_id = b.id and active;
  if not found then raise exception 'Service unavailable'; end if;
  local_end := (p_starts_at + make_interval(mins => s.duration_minutes)) at time zone 'Asia/Jakarta';
  select * into h from public.weekly_hours where business_id = b.id and day_of_week = extract(dow from local_start)::integer;
  if not found or h.opens_at is null or local_start::time < h.opens_at or local_end::date <> local_start::date or local_end::time > h.closes_at then
    raise exception 'Outside opening hours';
  end if;
  if exists(select 1 from public.date_blocks where business_id = b.id and blocked_date = local_start::date) then raise exception 'Date unavailable'; end if;
  update public.bookings set status = 'expired', updated_at = now() where business_id = b.id and status = 'pending' and expires_at <= now();
  select email into customer_email from auth.users where id = auth.uid();
  if customer_email is null then raise exception 'Email unavailable'; end if;
  insert into public.bookings(business_id, service_id, customer_id, customer_name, customer_email, customer_phone,
    service_name, duration_minutes, price_idr, starts_at, ends_at, expires_at)
  values (b.id, s.id, auth.uid(), trim(p_customer_name), customer_email, nullif(trim(coalesce(p_customer_phone, '')), ''),
    s.name, s.duration_minutes, s.price_idr, p_starts_at, p_starts_at + make_interval(mins => s.duration_minutes),
    least(now() + interval '24 hours', p_starts_at - interval '1 hour')) returning id into booking_id;
  return booking_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.weekly_hours enable row level security;
alter table public.date_blocks enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.email_outbox enable row level security;
alter table public.product_events enable row level security;

revoke all on public.profiles, public.businesses, public.services, public.weekly_hours, public.date_blocks,
  public.bookings, public.reviews, public.favorites, public.email_outbox, public.product_events from anon, authenticated;
grant select on public.businesses, public.services, public.weekly_hours, public.date_blocks, public.reviews to anon, authenticated;
grant select on public.profiles, public.bookings, public.favorites to authenticated;
grant execute on function public.create_booking(uuid, uuid, timestamptz, text, text) to authenticated;
revoke execute on function public.create_booking(uuid, uuid, timestamptz, text, text) from public, anon;
revoke execute on function public.expire_bookings() from public, anon, authenticated;

create policy profiles_own on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy businesses_read on public.businesses for select to anon, authenticated using (status = 'published' or owner_id = auth.uid() or public.is_admin());
create policy services_read on public.services for select to anon, authenticated using (
  exists(select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or b.owner_id = auth.uid() or public.is_admin()))
);
create policy hours_read on public.weekly_hours for select to anon, authenticated using (
  exists(select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or b.owner_id = auth.uid() or public.is_admin()))
);
create policy blocks_read on public.date_blocks for select to anon, authenticated using (
  exists(select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or b.owner_id = auth.uid() or public.is_admin()))
);
create policy bookings_read on public.bookings for select to authenticated using (
  customer_id = auth.uid() or public.is_admin() or exists(select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy reviews_read on public.reviews for select to anon, authenticated using (visible or customer_id = auth.uid() or public.is_admin());
create policy favorites_own on public.favorites for select to authenticated using (customer_id = auth.uid());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('business-images', 'business-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy business_images_public on storage.objects for select to anon, authenticated using (bucket_id = 'business-images');
