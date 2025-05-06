Create Table If Not Exists "public"."user-preferences" (
  id uuid NOT NULL Primary Key REFERENCES auth.users(id) on Delete Cascade,
  theme jsonb
);

Create Policy "All Access" On "public"."user-preferences" Using (true);

Alter table "public"."user-preferences" Enable Row Level Security;

Grant All on Table "public"."user-preferences" To "anon";
Grant All on Table "public"."user-preferences" To "authenticated";
Grant All on Table "public"."user-preferences" To "service_role";