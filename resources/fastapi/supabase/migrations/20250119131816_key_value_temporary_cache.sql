Create Table If Not Exists "public"."key_value_temporary" (
  key text Not Null Primary Key,
  value jsonb,
  created_at timestamp with time zone Default now() Not Null
);

