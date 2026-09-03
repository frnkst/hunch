alter type public.membership_status add value if not exists 'removed';

alter table public.question_choices
add column created_by uuid references public.profiles(user_id) on delete set null;

revoke select on public.question_choices from authenticated;
grant select (id, question_id, value, normalized_value, created_at)
on public.question_choices to authenticated;

drop function public.save_open_choice_prediction(uuid, uuid, uuid, text);

create function public.save_open_choice_prediction(
  target_question_id uuid,
  target_user_id uuid,
  target_choice_id uuid,
  new_choice_values text[],
  target_selected_new_index integer
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  selected_value text;
  contributed_count integer;
  new_count integer;
begin
  perform 1
  from public.questions
  where id = target_question_id
    and type = 'open_choice'
    and status = 'open'
    and deadline > now()
  for update;

  if not found then
    raise exception 'Predictions are closed or this is not an open-choice question.';
  end if;

  if cardinality(new_choice_values) > 3
    or exists (
      select 1
      from unnest(new_choice_values) as choice(value)
      where value <> btrim(value)
        or char_length(value) not between 1 and 100
    )
    or (
      select count(distinct lower(value))
      from unnest(new_choice_values) as choice(value)
    ) <> cardinality(new_choice_values)
  then
    raise exception 'Add up to 3 unique options, one per line.';
  end if;

  select count(*) into contributed_count
  from public.question_choices
  where question_id = target_question_id
    and created_by = target_user_id;

  select count(*) into new_count
  from unnest(new_choice_values) as choice(value)
  where not exists (
    select 1
    from public.question_choices existing
    where existing.question_id = target_question_id
      and existing.normalized_value = lower(choice.value)
  );

  if contributed_count + new_count > 3 then
    raise exception 'You can add at most 3 options to this hunch.';
  end if;

  insert into public.question_choices (question_id, value, created_by)
  select target_question_id, value, target_user_id
  from unnest(new_choice_values) as choice(value)
  on conflict (question_id, normalized_value) do nothing;

  if target_selected_new_index is not null then
    if target_selected_new_index < 0
      or target_selected_new_index >= cardinality(new_choice_values)
    then
      raise exception 'Choose a valid option.';
    end if;
    select value into selected_value
    from public.question_choices
    where question_id = target_question_id
      and normalized_value =
        lower(new_choice_values[target_selected_new_index + 1]);
  elsif target_choice_id is not null then
    select value into selected_value
    from public.question_choices
    where id = target_choice_id
      and question_id = target_question_id;
  end if;

  if selected_value is null then
    raise exception 'Choose a valid option.';
  end if;

  insert into public.predictions (question_id, user_id, answer, points)
  values (
    target_question_id,
    target_user_id,
    to_jsonb(selected_value),
    null
  )
  on conflict (question_id, user_id)
  do update set answer = excluded.answer, points = null;
end;
$$;

revoke all on function public.save_open_choice_prediction(
  uuid,
  uuid,
  uuid,
  text[],
  integer
) from public;
grant execute on function public.save_open_choice_prediction(
  uuid,
  uuid,
  uuid,
  text[],
  integer
) to service_role;
