CREATE TABLE IF NOT EXISTS "public"."v6-graphs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "postfix" "text",
    "data" "jsonb" NOT NULL,
    "presentation" "uuid" NOT NULL
);


ALTER TABLE "public"."v6-graphs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v6-presentations" (
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
    "summary" "text",
    "data" "jsonb"
);


ALTER TABLE "public"."v6-presentations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v6-slides" (
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


ALTER TABLE "public"."v6-slides" OWNER TO "postgres";



ALTER TABLE ONLY "public"."v6-graphs"
    ADD CONSTRAINT "v6-graphs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v6-presentations"
    ADD CONSTRAINT "v6-presentations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v6-slides"
    ADD CONSTRAINT "v6-slides_pkey" PRIMARY KEY ("id");


ALTER TABLE ONLY "public"."v6-presentations" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;


ALTER TABLE ONLY "public"."v6-graphs"
    ADD CONSTRAINT "v6-graphs_presentation_fkey" FOREIGN KEY ("presentation") REFERENCES "public"."v6-presentations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v6-slides"
    ADD CONSTRAINT "v6-slides_presentation_fkey" FOREIGN KEY ("presentation") REFERENCES "public"."v6-presentations"("id") ON DELETE CASCADE;



CREATE POLICY "All Access" ON "public"."v6-graphs" USING (true);
CREATE POLICY "All Access" ON "public"."v6-presentations" USING (true);
CREATE POLICY "All Access" ON "public"."v6-slides" USING (true);



ALTER TABLE "public"."v6-graphs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."v6-presentations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."v6-slides" ENABLE ROW LEVEL SECURITY;


GRANT ALL ON TABLE "public"."v6-graphs" TO "anon";
GRANT ALL ON TABLE "public"."v6-graphs" TO "authenticated";
GRANT ALL ON TABLE "public"."v6-graphs" TO "service_role";



GRANT ALL ON TABLE "public"."v6-presentations" TO "anon";
GRANT ALL ON TABLE "public"."v6-presentations" TO "authenticated";
GRANT ALL ON TABLE "public"."v6-presentations" TO "service_role";



GRANT ALL ON TABLE "public"."v6-slides" TO "anon";
GRANT ALL ON TABLE "public"."v6-slides" TO "authenticated";
GRANT ALL ON TABLE "public"."v6-slides" TO "service_role";
