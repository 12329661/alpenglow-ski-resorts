-- ski-resorts-website schema
-- Safe to re-run. Drops + recreates both tables and their public-read policies.

drop table if exists public.snow cascade;
drop table if exists public.resorts cascade;

create table public.resorts (
  id            integer primary key,
  name          text not null,
  latitude      double precision not null,
  longitude     double precision not null,
  country       text not null,
  continent     text not null,
  price         numeric,
  season        text,
  highest_point integer,
  lowest_point  integer
);

create table public.snow (
  resort_id integer not null references public.resorts(id) on delete cascade,
  month     date not null,
  snow      numeric not null,
  primary key (resort_id, month)
);

create index snow_resort_id_idx on public.snow (resort_id);

alter table public.resorts enable row level security;
alter table public.snow    enable row level security;

drop policy if exists "public read resorts" on public.resorts;
drop policy if exists "public read snow"    on public.snow;

create policy "public read resorts" on public.resorts for select using (true);
create policy "public read snow"    on public.snow    for select using (true);
