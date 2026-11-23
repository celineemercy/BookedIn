do $$
begin
  if exists (
    select 1
    from public.businesses
    group by owner_id
    having count(*) > 1
  ) then
    raise exception 'Cannot enforce one business per owner: consolidate duplicate owner records first';
  end if;
end;
$$;

alter table public.businesses
  add constraint businesses_one_per_owner unique (owner_id);
