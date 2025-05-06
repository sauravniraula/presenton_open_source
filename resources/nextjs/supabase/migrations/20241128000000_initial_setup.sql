-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing
drop table if exists usage_stats;
drop table if exists subscriptions;
drop table if exists customers;
drop type if exists subscription_tier;
drop type if exists subscription_status;

-- Create types
create type subscription_tier as enum ('free', 'standard', 'premium');
create type subscription_status as enum ('active', 'cancelled', 'past_due', 'trialing');

-- Create tables
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

-- Enable RLS
alter table customers enable row level security;
alter table subscriptions enable row level security;
alter table usage_stats enable row level security;

-- Create policies
create policy "Service role can manage customers" on customers for all using (true);
create policy "Users can view own customer data" on customers for select using (auth.uid() = id);

create policy "Service role can manage subscriptions" on subscriptions for all using (true);
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);

create policy "Service role can manage usage_stats" on usage_stats for all using (true);
create policy "Users can view own usage stats" on usage_stats for select using (auth.uid() = user_id);

-- Create indexes
create index idx_customers_stripe_customer_id on customers(stripe_customer_id);
create index idx_subscriptions_user_id on subscriptions(user_id);
create index idx_subscriptions_id on subscriptions(id);
create index idx_usage_stats_user_id on usage_stats(user_id);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add triggers
create trigger handle_updated_at before update on customers for each row execute procedure update_updated_at_column();
create trigger handle_updated_at before update on subscriptions for each row execute procedure update_updated_at_column();
create trigger handle_updated_at before update on usage_stats for each row execute procedure update_updated_at_column(); 