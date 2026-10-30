-- Travel Planner Schema

create extension if not exists "uuid-ossp";

create table trips (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  country     text not null check (country in ('china', 'japan', 'taiwan')),
  start_date  date,
  end_date    date,
  rating      int check (rating between 1 and 5),
  status      text not null default 'planning' check (status in ('planning', 'confirmed', 'completed')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table group_members (
  id       uuid primary key default uuid_generate_v4(),
  trip_id  uuid not null references trips(id) on delete cascade,
  name     text not null,
  age      int,
  notes    text
);

create table attractions (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  lat           numeric(10,7) not null,
  lng           numeric(10,7) not null,
  country       text,
  city          text,
  category      text,
  image_urls    text[],
  wikipedia_url text,
  osm_id        text,
  created_at    timestamptz not null default now()
);

create table routes (
  id          uuid primary key default uuid_generate_v4(),
  trip_id     uuid not null references trips(id) on delete cascade,
  name        text not null,
  description text,
  total_days  int,
  rating      int check (rating between 1 and 5),
  is_active   boolean not null default false,
  created_at  timestamptz not null default now()
);

create table route_stages (
  id         uuid primary key default uuid_generate_v4(),
  route_id   uuid not null references routes(id) on delete cascade,
  day_number int not null,
  date       date,
  title      text,
  notes      text,
  unique(route_id, day_number)
);

create table stage_attractions (
  id                uuid primary key default uuid_generate_v4(),
  stage_id          uuid not null references route_stages(id) on delete cascade,
  attraction_id     uuid not null references attractions(id),
  order_index       int not null,
  duration_hours    numeric(4,2),
  transport_to_next text,
  notes             text
);

create table trip_attractions (
  id            uuid primary key default uuid_generate_v4(),
  trip_id       uuid not null references trips(id) on delete cascade,
  attraction_id uuid not null references attractions(id),
  notes         text,
  unique(trip_id, attraction_id)
);

-- Auto-update updated_at on trips
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trips_updated_at
  before update on trips
  for each row execute function update_updated_at();
