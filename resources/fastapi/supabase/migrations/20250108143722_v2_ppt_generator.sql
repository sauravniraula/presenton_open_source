CREATE TABLE IF NOT EXISTS "public"."v2-graphs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "postfix" "text",
    "data" "jsonb" NOT NULL,
    "presentation" "uuid" NOT NULL
);


ALTER TABLE "public"."v2-graphs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v2-presentations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "prompt" "text" NOT NULL,
    "n_slides" smallint NOT NULL,
    "theme" "text",
    "file" "text",
    "vector_store" "text",
    "titles" "jsonb" NOT NULL,
    "summary" "text",
    "data" "jsonb"
);


ALTER TABLE "public"."v2-presentations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v2-slides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "index" smallint NOT NULL,
    "type" smallint NOT NULL,
    "thumbnail" "text" NOT NULL,
    "image" "text",
    "image_prompt" "text",
    "graph" "text",
    "content" "jsonb" NOT NULL,
    "presentation" "uuid" NOT NULL
);


ALTER TABLE "public"."v2-slides" OWNER TO "postgres";



ALTER TABLE ONLY "public"."v2-graphs"
    ADD CONSTRAINT "v2-graphs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v2-presentations"
    ADD CONSTRAINT "v2-presentations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v2-slides"
    ADD CONSTRAINT "v2-slides_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."v2-graphs"
    ADD CONSTRAINT "v2-graphs_presentation_fkey" FOREIGN KEY ("presentation") REFERENCES "public"."v2-presentations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v2-slides"
    ADD CONSTRAINT "v2-slides_presentation_fkey" FOREIGN KEY ("presentation") REFERENCES "public"."v2-presentations"("id") ON DELETE CASCADE;



CREATE POLICY "All Access" ON "public"."v2-graphs" USING (true);



CREATE POLICY "All Access" ON "public"."v2-presentations" USING (true);



CREATE POLICY "All Access" ON "public"."v2-slides" USING (true);




ALTER TABLE "public"."v2-graphs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."v2-presentations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."v2-slides" ENABLE ROW LEVEL SECURITY;


GRANT ALL ON TABLE "public"."v2-graphs" TO "anon";
GRANT ALL ON TABLE "public"."v2-graphs" TO "authenticated";
GRANT ALL ON TABLE "public"."v2-graphs" TO "service_role";



GRANT ALL ON TABLE "public"."v2-presentations" TO "anon";
GRANT ALL ON TABLE "public"."v2-presentations" TO "authenticated";
GRANT ALL ON TABLE "public"."v2-presentations" TO "service_role";



GRANT ALL ON TABLE "public"."v2-slides" TO "anon";
GRANT ALL ON TABLE "public"."v2-slides" TO "authenticated";
GRANT ALL ON TABLE "public"."v2-slides" TO "service_role";
