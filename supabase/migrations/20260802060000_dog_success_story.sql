-- Lets an admin write a short adoption success story for a dog, shown on
-- the public Success Stories page once the dog is marked adopted.

alter table public.dogs
  add column if not exists success_story text
    check (success_story is null or char_length(success_story) <= 500);
