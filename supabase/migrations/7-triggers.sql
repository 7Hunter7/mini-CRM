-- ТРИГГЕРЫ
create trigger before_task_update
  before update on tasks
  for each row execute function check_status_transition();

create or replace function log_task_history()
returns trigger as $$
begin
  insert into task_history (task_id, changed_by, from_status, to_status, comment)
  values (
    NEW.id, 
    auth.uid(), 
    OLD.status, 
    NEW.status, 
    -- Если статус 'rework', берем комментарий из задачи, иначе null
    case when NEW.status = 'rework' then NEW.rework_comment else null end
  );
  return NEW;
end;
$$ language plpgsql;

create trigger after_task_update
  after update on tasks
  for each row execute function log_task_history();
