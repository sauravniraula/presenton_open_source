ALTER TABLE "v4-presentations"
ADD COLUMN "user_id" UUID NOT NULL, 
ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."customers" ("id") ON DELETE CASCADE;


ALTER TABLE "v4-slides" ADD COLUMN "design_type" TEXT NOT NULL;