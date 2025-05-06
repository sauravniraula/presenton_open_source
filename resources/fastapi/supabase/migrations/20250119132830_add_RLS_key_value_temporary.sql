Create Policy "All Access" On "public"."key_value_temporary" Using (true);

Alter table "public"."key_value_temporary" Enable Row Level Security;

Grant All on Table "public"."key_value_temporary" To "anon";
Grant All on Table "public"."key_value_temporary" To "authenticated";
Grant All on Table "public"."key_value_temporary" To "service_role";