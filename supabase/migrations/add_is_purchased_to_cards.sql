alter table public.cards
add column if not exists is_purchased boolean;

update public.cards
set is_purchased = false
where is_purchased is null;

alter table public.cards
alter column is_purchased set default false;

alter table public.cards
alter column is_purchased set not null;
