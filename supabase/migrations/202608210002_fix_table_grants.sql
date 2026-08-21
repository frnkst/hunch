grant usage on schema public to authenticated, service_role;

grant select on table
  public.profiles,
  public.questions,
  public.predictions
to authenticated;

grant all privileges on table
  public.profiles,
  public.questions,
  public.predictions
to service_role;
