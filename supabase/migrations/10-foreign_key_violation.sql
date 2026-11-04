-- Ошибка "foreign key violation"
-- Означает, что объекты в базе создались не с теми ID, которые предложены (bbbbbbbb-...), а с автогенерацией (gen_random_uuid()), либо через Table Editor.

-- 1. Создаем задачи, подтягивая object_id по названию, а assignee/author по email
insert into tasks (id, title, description, object_id, assignee_id, author_id, status)
values 
  (
    'd0000001-0000-4000-8000-000000000001', 
    'Заказать бетон М300', 'Нужно 5 кубов', 
    (select id from objects where name = 'ЖК Солнечный'), 
    (select id from profiles where email = 'executor1@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'new'
  ),
  (
    'd0000002-0000-4000-8000-000000000002', 
    'Проверить фундамент', 'Осмотр перед заливкой', 
    (select id from objects where name = 'ЖК Солнечный'), 
    (select id from profiles where email = 'executor1@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'in_progress'
  ),
  (
    'd0000003-0000-4000-8000-000000000003', 
    'Согласовать смету', 'Смета во вложении', 
    (select id from objects where name = 'БЦ Речной'), 
    (select id from profiles where email = 'executor2@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'review'
  ),
  (
    'd0000004-0000-4000-8000-000000000004', 
    'Отчёт по материалам', 'Отчет за квартал', 
    (select id from objects where name = 'БЦ Речной'), 
    (select id from profiles where email = 'executor2@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'done'
  ),
  (
    'd0000005-0000-4000-8000-000000000005', 
    'Переделать чертёж', 'Ошибки в размерах', 
    (select id from objects where name = 'Склад №4'), 
    (select id from profiles where email = 'executor1@test.com'), 
    (select id from profiles where email = 'manager@test.com'), 
    'rework'
  )
on conflict (id) do update set 
  title = excluded.title, 
  description = excluded.description, 
  object_id = excluded.object_id, 
  assignee_id = excluded.assignee_id, 
  author_id = excluded.author_id, 
  status = excluded.status;

-- 2. Добавляем историю
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