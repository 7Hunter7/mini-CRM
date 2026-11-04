-- Запрет на изменение истории
create policy "No updates to history" on task_history for update using (false);
create policy "No deletes to history" on task_history for delete using (false);