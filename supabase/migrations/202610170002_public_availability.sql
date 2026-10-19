create function public.get_busy_slots(p_business_ids uuid[], p_from timestamptz, p_to timestamptz)
returns table (business_id uuid, starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = public as $$
  select b.business_id, b.starts_at, b.ends_at
  from public.bookings b join public.businesses s on s.id = b.business_id
  where b.business_id = any(p_business_ids)
    and s.status = 'published'
    and b.status in ('pending', 'accepted')
    and b.ends_at > p_from and b.starts_at < p_to;
$$;
revoke execute on function public.get_busy_slots(uuid[], timestamptz, timestamptz) from public;
grant execute on function public.get_busy_slots(uuid[], timestamptz, timestamptz) to anon, authenticated;
