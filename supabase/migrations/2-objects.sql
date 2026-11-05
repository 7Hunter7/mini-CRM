-- 2. Объекты
create table objects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Включаем RLS
alter table objects enable row level security;

-- Добавляем базовые Объекты
insert into objects (id, name, address)
values 
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'ЖК Солнечный', 'СПб, ул. Ленина, 15'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'БЦ Речной', 'СПб, наб. Волги, 3'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Склад №4', 'СПб, промзона «Юг»')
on conflict (id) do nothing;