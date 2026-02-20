-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table
create table public.users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  avatar text,
  bg_color text,
  is_column_challenge boolean default false, -- New: Column Challenge participation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create journals table (Submissions)
create table public.journals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  type text not null check (type in ('journal', 'account', 'thread', 'mate', 'column')), -- New: Submission Type
  content text, -- New: URL or Notes (formerly link)
  amount integer, -- New: For Account Book
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date, type) -- Updated: Allow multiple submissions per day if different types
);

-- Enable Row Level Security (RLS) - Optional for simple MVP, but good practice
alter table public.users enable row level security;
alter table public.journals enable row level security;

-- Create policies (For this simple app, we might allow public access to simplify 'login by name' without email auth)
-- WARNING: This is open access. For production, consider proper Auth.
create policy "Allow public read/write access to users"
on public.users for all using (true) with check (true);

create policy "Allow public read/write access to journals"
on public.journals for all using (true) with check (true);
