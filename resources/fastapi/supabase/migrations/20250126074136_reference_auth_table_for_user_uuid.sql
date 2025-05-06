ALTER TABLE "public"."v5-presentations"
DROP CONSTRAINT "fk_user_id";

ALTER TABLE "public"."v5-presentations"
ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;