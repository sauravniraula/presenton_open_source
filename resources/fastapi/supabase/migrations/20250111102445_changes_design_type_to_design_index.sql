alter table "v4-slides"
drop column "design_type",
add column "design_index" smallint not null;