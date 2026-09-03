create function public.get_open_choice_contribution_count(
  target_question_id uuid
)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when public.is_approved() then (
      select count(*)::integer
      from public.question_choices
      where question_id = target_question_id
        and created_by = (select auth.uid())
    )
    else 0
  end;
$$;

revoke all on function public.get_open_choice_contribution_count(uuid)
from public;
grant execute on function public.get_open_choice_contribution_count(uuid)
to authenticated;
