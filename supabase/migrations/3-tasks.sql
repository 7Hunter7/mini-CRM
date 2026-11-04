-- 3. Задачи
create table tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  object_id uuid references objects(id) on delete cascade not null,
  assignee_id uuid references profiles(id) not null,
  status text check (status in ('new', 'in_progress', 'review', 'done', 'rework')) not null default 'new',
  author_id uuid references profiles(id) not null,
  rework_comment text, -- для возврата на доработку
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Включаем RLS
alter table tasks enable row level security;

-- Добавляем данные
-- Используем подзапросы (SELECT id FROM profiles WHERE email = ...), 
-- чтобы автоматически подставить реальные ID пользователей.
insert into tasks (id, title, description, object_id, assignee_id, author_id, status)
values 
  (
    'd0000001-0000-4000-8000-000000000001', 
    'Заказать бетон М300', 'Нужно 5 кубов', 
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
    (select id from profiles where email = 'executor1@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'new'
  ),
  (
    'd0000002-0000-4000-8000-000000000002', 
    'Проверить фундамент', 'Осмотр перед заливкой', 
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
    (select id from profiles where email = 'executor1@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'in_progress'
  ),
  (
    'd0000003-0000-4000-8000-000000000003', 
    'Согласовать смету', 'Смета во вложении', 
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
    (select id from profiles where email = 'executor2@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'review'
  ),
  (
    'd0000004-0000-4000-8000-000000000004', 
    'Отчёт по материалам', 'Отчет за квартал', 
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
    (select id from profiles where email = 'executor2@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'done'
  ),
  (
    'd0000005-0000-4000-8000-000000000005', 
    'Переделать чертёж', 'Ошибки в размерах', 
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 
    (select id from profiles where email = 'executor1@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'rework'
  )
on conflict (id) do nothing;