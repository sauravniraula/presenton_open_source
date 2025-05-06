CREATE TABLE IF NOT EXISTS "public"."v4-graphs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "postfix" "text",
    "data" "jsonb" NOT NULL,
    "presentation" "uuid" NOT NULL
);


ALTER TABLE "public"."v4-graphs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v4-presentations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "prompt" "text",
    "n_slides" smallint NOT NULL,
    "theme" "text",
    "file" "text",
    "vector_store" "text",
    "title" "text" NOT NULL,
    "titles" "jsonb" NOT NULL,
    "summary" "text",
    "data" "jsonb"
);


ALTER TABLE "public"."v4-presentations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v4-slides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "index" smallint NOT NULL,
    "type" smallint NOT NULL,
    "thumbnail" "text" NOT NULL,
    "images" "jsonb",
    "icons" "jsonb",
    "graph_id" "uuid",
    "content" "jsonb" NOT NULL,
    "presentation" "uuid" NOT NULL
);


ALTER TABLE "public"."v4-slides" OWNER TO "postgres";



ALTER TABLE ONLY "public"."v4-graphs"
    ADD CONSTRAINT "v4-graphs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v4-presentations"
    ADD CONSTRAINT "v4-presentations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v4-slides"
    ADD CONSTRAINT "v4-slides_pkey" PRIMARY KEY ("id");




ALTER TABLE ONLY "public"."v4-graphs"
    ADD CONSTRAINT "v4-graphs_presentation_fkey" FOREIGN KEY ("presentation") REFERENCES "public"."v4-presentations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v4-slides"
    ADD CONSTRAINT "v4-slides_presentation_fkey" FOREIGN KEY ("presentation") REFERENCES "public"."v4-presentations"("id") ON DELETE CASCADE;



CREATE POLICY "All Access" ON "public"."v4-graphs" USING (true);
CREATE POLICY "All Access" ON "public"."v4-presentations" USING (true);
CREATE POLICY "All Access" ON "public"."v4-slides" USING (true);



ALTER TABLE "public"."v4-graphs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."v4-presentations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."v4-slides" ENABLE ROW LEVEL SECURITY;


GRANT ALL ON TABLE "public"."v4-graphs" TO "anon";
GRANT ALL ON TABLE "public"."v4-graphs" TO "authenticated";
GRANT ALL ON TABLE "public"."v4-graphs" TO "service_role";



GRANT ALL ON TABLE "public"."v4-presentations" TO "anon";
GRANT ALL ON TABLE "public"."v4-presentations" TO "authenticated";
GRANT ALL ON TABLE "public"."v4-presentations" TO "service_role";



GRANT ALL ON TABLE "public"."v4-slides" TO "anon";
GRANT ALL ON TABLE "public"."v4-slides" TO "authenticated";
GRANT ALL ON TABLE "public"."v4-slides" TO "service_role";
