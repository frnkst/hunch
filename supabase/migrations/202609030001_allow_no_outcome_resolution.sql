alter table public.questions
drop constraint question_resolution_check;

alter table public.questions
add constraint question_resolution_check check (
  (status = 'resolved' and resolved_at is not null)
  or (
    status <> 'resolved'
    and correct_answer is null
    and resolved_at is null
  )
);
