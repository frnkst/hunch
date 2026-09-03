alter type public.question_type add value if not exists 'open_choice';

create table public.question_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  value text not null
    check (value = btrim(value) and char_length(value) between 1 and 100),
  normalized_value text generated always as (lower(value)) stored,
  created_at timestamptz not null default now(),
  unique (question_id, normalized_value)
);

create index question_choices_question_idx
on public.question_choices (question_id, created_at);

alter table public.question_choices enable row level security;

grant select on public.question_choices to authenticated;
grant all privileges on public.question_choices to service_role;

create policy "Approved members can view open choices"
on public.question_choices for select to authenticated
using (public.is_approved());

create function public.save_open_choice_prediction(
  target_question_id uuid,
  target_user_id uuid,
  target_choice_id uuid,
  new_choice_value text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  selected_value text;
begin
  if not exists (
    select 1
    from public.questions
    where id = target_question_id
      and type = 'open_choice'
      and status = 'open'
      and deadline > now()
  ) then
    raise exception 'Predictions are closed or this is not an open-choice question.';
  end if;

  if new_choice_value is not null then
    if new_choice_value <> btrim(new_choice_value)
      or char_length(new_choice_value) not between 1 and 100
    then
      raise exception 'Choice must be between 1 and 100 characters.';
    end if;

    insert into public.question_choices (question_id, value)
    values (target_question_id, new_choice_value)
    on conflict (question_id, normalized_value) do nothing;

    select value into selected_value
    from public.question_choices
    where question_id = target_question_id
      and normalized_value = lower(new_choice_value);
  elsif target_choice_id is not null then
    select value into selected_value
    from public.question_choices
    where id = target_choice_id
      and question_id = target_question_id;
  end if;

  if selected_value is null then
    raise exception 'Choose a valid choice.';
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
  text
) from public;
grant execute on function public.save_open_choice_prediction(
  uuid,
  uuid,
  uuid,
  text
) to service_role;
