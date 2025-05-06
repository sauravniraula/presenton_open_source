CREATE TABLE IF NOT EXISTS "public"."v7-graphs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "postfix" "text",
    "data" "jsonb" NOT NULL,
    "presentation" "uuid" NOT NULL
);


ALTER TABLE "public"."v7-graphs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v7-tables" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "presentation" "uuid" NOT NULL,
  "name" "text",
  "markdown" "text"
);


CREATE TABLE IF NOT EXISTS "public"."v7-presentations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "prompt" "text",
    "n_slides" smallint NOT NULL,
    "theme" "jsonb",
    "thumbnail" "text",
    "language" "text",
    "file" "text",
    "vector_store" "text",
    "title" "text",
    "titles" "jsonb",
    "big_idea" "text",
    "story_type" "text",
    "story" "jsonb",
    "interpreted_report_content" "jsonb",
    "questions" "jsonb",
    "answers" "jsonb",
    "summary" "text",
    "data" "jsonb"
);


ALTER TABLE "public"."v7-presentations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v7-slides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "index" smallint NOT NULL,
    "type" smallint NOT NULL,
    "design_index" smallint,
    "images" "jsonb",
    "icons" "jsonb",
    "graph_id" "uuid",
    "content" "jsonb" NOT NULL,
    "presentation" "uuid" NOT NULL
);


ALTER TABLE "public"."v7-slides" OWNER TO "postgres";



ALTER TABLE ONLY "public"."v7-graphs"
    ADD CONSTRAINT "v7-graphs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v7-presentations"
    ADD CONSTRAINT "v7-presentations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v7-slides"
    ADD CONSTRAINT "v7-slides_pkey" PRIMARY KEY ("id");


ALTER TABLE ONLY "public"."v7-presentations" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;


ALTER TABLE ONLY "public"."v7-graphs"
    ADD CONSTRAINT "v7-graphs_presentation_fkey" FOREIGN KEY ("presentation") REFERENCES "public"."v7-presentations"("id") ON DELETE CASCADE;


ALTER TABLE ONLY "public"."v7-tables"
    ADD CONSTRAINT "v7-graphs_presentation_fkey" FOREIGN KEY ("presentation") REFERENCES "public"."v7-presentations"("id") ON DELETE CASCADE;


ALTER TABLE ONLY "public"."v7-slides"
    ADD CONSTRAINT "v7-slides_presentation_fkey" FOREIGN KEY ("presentation") REFERENCES "public"."v7-presentations"("id") ON DELETE CASCADE;



CREATE POLICY "All Access" ON "public"."v7-graphs" USING (true);
CREATE POLICY "All Access" ON "public"."v7-presentations" USING (true);
CREATE POLICY "All Access" ON "public"."v7-slides" USING (true);



ALTER TABLE "public"."v7-graphs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."v7-presentations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."v7-slides" ENABLE ROW LEVEL SECURITY;


GRANT ALL ON TABLE "public"."v7-graphs" TO "anon";
GRANT ALL ON TABLE "public"."v7-graphs" TO "authenticated";
GRANT ALL ON TABLE "public"."v7-graphs" TO "service_role";



GRANT ALL ON TABLE "public"."v7-presentations" TO "anon";
GRANT ALL ON TABLE "public"."v7-presentations" TO "authenticated";
GRANT ALL ON TABLE "public"."v7-presentations" TO "service_role";



GRANT ALL ON TABLE "public"."v7-slides" TO "anon";
GRANT ALL ON TABLE "public"."v7-slides" TO "authenticated";
GRANT ALL ON TABLE "public"."v7-slides" TO "service_role";
