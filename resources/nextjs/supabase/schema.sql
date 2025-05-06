-- Schema definition
create type subscription_tier as enum ('free', 'standard', 'premium');
create type subscription_status as enum ('active', 'cancelled', 'past_due', 'trialing');

-- Base tables
create table customers (
  id uuid references auth.users on delete cascade not null primary key,
  stripe_customer_id text unique,
  email text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table subscriptions (
  id text primary key,
  user_id uuid references auth.users not null,
  status subscription_status default 'active',
  tier subscription_tier default 'free',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table usage_stats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null unique,
  exports_count integer default 0,
  slides_count integer default 0,
  ai_videos_count integer default 0,
  total_upload_size bigint default 0,
  total_video_duration integer default 0,
  video_with_avatar_count integer default 0,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
); 