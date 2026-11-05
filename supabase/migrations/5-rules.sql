-- ПРАВИЛА ДОСТУПА (RLS)
-- Разрешаем авторизованным пользователям читать свой профиль
create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

-- Менеджер может видеть всех пользователей
create policy "Managers can view all profiles"
on profiles for select
using ((select role from profiles where id = auth.uid()) = 'manager');

-- Постановщик видит всё
create policy "Managers can do everything on objects" on objects for all using (
  (select role from profiles where id = auth.uid()) = 'manager'
);
create policy "Managers can do everything on tasks" on tasks for all using (
  (select role from profiles where id = auth.uid()) = 'manager'
);

-- Исполнитель видит только свои задачи и связанные объекты
create policy "Executors can view their tasks" on tasks for select using (
  (select role from profiles where id = auth.uid()) = 'executor' AND assignee_id = auth.uid()
);
create policy "Executors can view related objects" on objects for select using (
  exists (select 1 from tasks where tasks.object_id = objects.id and tasks.assignee_id = auth.uid())
);

-- ИСПОЛНИТЕЛЬ МОЖЕТ ОБНОВЛЯТЬ СВОИ ЗАДАЧИ (для перехода статусов)
create policy "Executors can update their tasks" on tasks for update using (
  (select role from profiles where id = auth.uid()) = 'executor' AND assignee_id = auth.uid()
) with check (
  (select role from profiles where id = auth.uid()) = 'executor' AND assignee_id = auth.uid()
);

-- ИСТОРИЯ: Триггер должен иметь возможность писать, пользователи - читать
create policy "Allow insert for task history" on task_history for insert with check (true);
-- Исполнитель не может прочитать или изменить чужие задачи
create policy "Users can view history of their tasks" on task_history for select using (
  exists (
    select 1 from tasks 
    where tasks.id = task_history.task_id 
    and (
      (select role from profiles where id = auth.uid()) = 'manager'
      or tasks.assignee_id = auth.uid()
    )
  )
);