ALTER TABLE "public"."v4-presentations"
DROP CONSTRAINT "fk_user_id";

ALTER TABLE "public"."v4-presentations"
ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;