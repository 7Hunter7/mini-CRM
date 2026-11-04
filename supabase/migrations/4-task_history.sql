-- 4. История
create table task_history (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  changed_by uuid references profiles(id) not null,
  from_status text,
  to_status text not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Включаем RLS
alter table task_history enable row level security;

-- Добавляем историю для завершенных/возвращенных задач
-- (Для статусов done и rework история должна быть, чтобы карточка выглядела реалистично)
insert into task_history (task_id, changed_by, from_status, to_status, comment)
values 
  (
    'd0000004-0000-4000-8000-000000000004', 
    (select id from profiles where email = 'manager@test.com'), 
    'review', 'done', 'Все верно, принято'
  ),
  (
    'd0000005-0000-4000-8000-000000000005', 
    (select id from profiles where email = 'manager@test.com'), 
    'review', 'rework', 'Переделать по замечаниям'
  );