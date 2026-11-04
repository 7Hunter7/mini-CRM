-- ФУНКЦИЯ ПРОВЕРКИ ПЕРЕХОДА СТАТУСА
create or replace function check_status_transition()
returns trigger as $$
begin
  if OLD.status = 'new' and NEW.status != 'in_progress' then raise exception 'Invalid transition'; end if;
  if OLD.status = 'in_progress' and NEW.status != 'review' then raise exception 'Invalid transition'; end if;
  if OLD.status = 'review' and NEW.status not in ('done', 'rework') then raise exception 'Invalid transition'; end if;
  if OLD.status = 'rework' and NEW.status != 'in_progress' then raise exception 'Invalid transition'; end if;
  if OLD.status = 'done' then raise exception 'Task is done'; end if;
  return NEW;
end;
$$ language plpgsql;
