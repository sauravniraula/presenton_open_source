ALTER TABLE "public"."v7-tables" ENABLE ROW LEVEL SECURITY;


GRANT ALL ON TABLE "public"."v7-tables" TO "anon";
GRANT ALL ON TABLE "public"."v7-tables" TO "authenticated";
GRANT ALL ON TABLE "public"."v7-tables" TO "service_role";