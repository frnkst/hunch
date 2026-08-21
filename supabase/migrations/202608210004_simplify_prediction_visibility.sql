update public.questions
set visibility = 'after_deadline'
where visibility in ('after_submission', 'after_resolution');

create or replace function public.can_view_prediction(
  target_question_id uuid,
  prediction_owner_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    prediction_owner_id = (select auth.uid())
    or (
      public.is_approved()
      and exists (
        select 1
        from public.questions q
        where q.id = target_question_id
          and (
            q.visibility = 'always'
            or now() >= q.deadline
          )
      )
    );
$$;
