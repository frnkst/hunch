create function public.list_prediction_participants(target_question_id uuid)
returns table (
  user_id uuid,
  username text,
  avatar_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    prediction.user_id,
    profile.username,
    profile.avatar_url
  from public.predictions prediction
  join public.profiles profile on profile.user_id = prediction.user_id
  where prediction.question_id = target_question_id
    and public.is_approved()
  order by prediction.updated_at;
$$;

revoke all on function public.list_prediction_participants(uuid) from public;
grant execute on function public.list_prediction_participants(uuid)
to authenticated;
