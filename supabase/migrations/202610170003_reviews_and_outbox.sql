alter table public.reviews add column reported_at timestamptz;
alter table public.reviews add column report_reason text;
alter table public.email_outbox add column claimed_until timestamptz;

create function public.claim_email_batch(p_limit integer default 20)
returns setof public.email_outbox language plpgsql security definer set search_path = public as $$
begin
  return query
  with chosen as (
    select id from public.email_outbox
    where sent_at is null and next_attempt_at <= now() and (claimed_until is null or claimed_until <= now())
    order by created_at limit least(greatest(p_limit, 1), 50) for update skip locked
  )
  update public.email_outbox e set claimed_until = now() + interval '2 minutes'
  from chosen where e.id = chosen.id returning e.*;
end;
$$;
revoke execute on function public.claim_email_batch(integer) from public, anon, authenticated;
grant execute on function public.claim_email_batch(integer) to service_role;
