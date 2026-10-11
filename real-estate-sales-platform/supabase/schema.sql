-- Draft schema for the production backend.
-- Review and test in a non-production Supabase project before applying.
create extension if not exists pgcrypto;

create type public.property_type as enum ('land', 'house', 'commercial', 'other');
create type public.listing_status as enum ('draft', 'published', 'archived');
create type public.availability_status as enum ('available', 'reserved', 'sold', 'unavailable');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'viewing_requested', 'viewing_confirmed', 'negotiation', 'won', 'lost', 'nurture');

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_description text,
  description text not null,
  property_type public.property_type not null,
  listing_status public.listing_status not null default 'draft',
  availability_status public.availability_status not null default 'available',
  price numeric(16,2),
  currency text not null default 'NGN',
  state text,
  city text not null,
  area text,
  public_location text,
  land_size numeric(12,2),
  land_size_unit text,
  bedrooms integer,
  bathrooms integer,
  amenities text[] not null default '{}',
  payment_plan text,
  documentation_status text,
  public_verification_note text,
  private_verification_notes text,
  source_developer text,
  commission_rate numeric(7,4),
  commission_basis text,
  seo_title text,
  seo_description text,
  image_urls text[] not null default '{}',
  last_verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_public_search_idx
  on public.properties (listing_status, availability_status, city, property_type);
create index properties_price_idx on public.properties (price);
create index properties_updated_idx on public.properties (updated_at desc);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  preferred_contact text,
  property_id uuid references public.properties(id) on delete set null,
  preferred_city text,
  preferred_property_type public.property_type,
  budget_min numeric(16,2),
  budget_max numeric(16,2),
  currency text not null default 'NGN',
  purchase_timeline text,
  buyer_location text,
  message text,
  consent_to_follow_up boolean not null default false,
  consent_recorded_at timestamptz,
  status public.lead_status not null default 'new',
  lead_score integer not null default 0,
  source text,
  next_follow_up_at timestamptz,
  opted_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_created_idx on public.leads (status, created_at desc);
create index leads_property_idx on public.leads (property_id);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  activity_type text not null,
  summary text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  due_at timestamptz not null,
  task_type text not null default 'manual',
  status text not null default 'pending',
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.viewing_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict,
  requested_start timestamptz,
  requested_end timestamptz,
  status text not null default 'pending',
  confirmed_start timestamptz,
  confirmed_end timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table public.commission_records (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  developer_name text,
  commission_rate numeric(7,4),
  commission_basis text,
  expected_amount numeric(16,2),
  confirmed_amount numeric(16,2),
  currency text not null default 'NGN',
  payment_status text not null default 'expected',
  earned_at timestamptz,
  received_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- Security baseline: public visitors may read only published, available inventory.
alter table public.properties enable row level security;
create policy "Public can read available published properties"
on public.properties for select
using (listing_status = 'published' and availability_status = 'available');

-- No public policies are added for leads, activities, follow-ups, viewing requests,
-- or commission records. They must remain private until server-side intake and
-- administrator authorization have been implemented and tested.
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.follow_up_tasks enable row level security;
alter table public.viewing_requests enable row level security;
alter table public.commission_records enable row level security;

-- Production TODO:
-- 1. Define a secure administrator identity/role policy.
-- 2. Add server-side lead intake with validation, rate limits and anti-spam.
-- 3. Add tightly scoped lead INSERT access or a server-side trusted function.
-- 4. Add updated_at triggers and audit logging.
-- 5. Test policies with anon and authenticated roles before collecting real leads.

-- Editable website content (written only by the server with the service-role key).
create table if not exists public.site_settings (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
-- No public policies: the browser never reads this table directly; the Next.js server does.
