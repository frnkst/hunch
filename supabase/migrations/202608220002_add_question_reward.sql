alter table public.questions
add column reward text
check (reward is null or char_length(reward) between 1 and 200);
