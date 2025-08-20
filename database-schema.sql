-- Pulse App Social Features Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  display_name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User stats for leaderboard
create table if not exists public.user_stats (
  user_id uuid references public.users(id) on delete cascade primary key,
  current_streak integer default 0,
  longest_streak integer default 0,
  total_xp integer default 0,
  level integer default 1,
  mood_shares_count integer default 0,
  last_active_date date default current_date,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friendships table
create table if not exists public.friendships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  friend_id uuid references public.users(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure no duplicate friendships
  unique(user_id, friend_id),
  -- Prevent self-friendship
  check (user_id != friend_id)
);

-- Mood shares table
create table if not exists public.mood_shares (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  mood integer check (mood >= -2 and mood <= 2) not null,
  energy text check (energy in ('low', 'med', 'high')) not null,
  message text,
  shared_with uuid[] default '{}', -- Array of user IDs who can see this
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.user_stats enable row level security;
alter table public.friendships enable row level security;
alter table public.mood_shares enable row level security;

-- Users policies
create policy "Users can view other users' public info" on public.users
  for select using (true);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

-- User stats policies  
create policy "Anyone can view user stats" on public.user_stats
  for select using (true);

create policy "Users can update their own stats" on public.user_stats
  for all using (auth.uid() = user_id);

-- Friendships policies
create policy "Users can view their own friendships" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can create friendships" on public.friendships
  for insert with check (auth.uid() = user_id);

create policy "Users can update friendships they're part of" on public.friendships
  for update using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can delete friendships they're part of" on public.friendships
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- Mood shares policies
create policy "Users can view mood shares they have access to" on public.mood_shares
  for select using (
    auth.uid() = user_id or 
    auth.uid() = any(shared_with)
  );

create policy "Users can create their own mood shares" on public.mood_shares
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own mood shares" on public.mood_shares
  for update using (auth.uid() = user_id);

create policy "Users can delete their own mood shares" on public.mood_shares
  for delete using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_friendships_user_id on public.friendships(user_id);
create index if not exists idx_friendships_friend_id on public.friendships(friend_id);
create index if not exists idx_friendships_status on public.friendships(status);
create index if not exists idx_mood_shares_user_id on public.mood_shares(user_id);
create index if not exists idx_mood_shares_created_at on public.mood_shares(created_at desc);
create index if not exists idx_mood_shares_shared_with on public.mood_shares using gin(shared_with);
create index if not exists idx_user_stats_current_streak on public.user_stats(current_streak desc);
create index if not exists idx_user_stats_longest_streak on public.user_stats(longest_streak desc);
create index if not exists idx_user_stats_total_xp on public.user_stats(total_xp desc);

-- Functions and triggers for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger handle_user_stats_updated_at
  before update on public.user_stats
  for each row execute function public.handle_updated_at();

-- Leaderboard view (optional - can be computed in application)
create or replace view public.leaderboard_view as
select 
  us.user_id,
  u.display_name,
  u.avatar_url,
  us.current_streak,
  us.longest_streak,
  us.total_xp,
  us.level,
  us.mood_shares_count,
  us.last_active_date,
  row_number() over (order by us.current_streak desc, us.total_xp desc) as rank
from public.user_stats us
join public.users u on us.user_id = u.id
order by us.current_streak desc, us.total_xp desc;

-- Grant permissions to authenticated users
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Success message
select 'Pulse social features database schema created successfully!' as message;
