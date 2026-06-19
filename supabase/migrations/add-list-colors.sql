do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'list_color'
  ) then
    create type public.list_color as enum ('branco', 'azul', 'preto', 'verde', 'vermelho');
  end if;
end
$$;

alter table public.lists
add column if not exists colors public.list_color[] not null default '{}'::public.list_color[];

comment on column public.lists.colors is 'Cores associadas a lista.';

create index if not exists lists_colors_gin_idx
on public.lists
using gin (colors);
