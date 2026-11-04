-- 1. Профили пользователей
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text check (role in ('manager', 'executor')) not null default 'executor'
);

-- Включаем RLS
alter table profiles enable row level security;