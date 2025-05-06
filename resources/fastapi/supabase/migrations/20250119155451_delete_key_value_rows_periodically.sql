CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION delete_key_value_old_rows()
RETURNS VOID AS $$
BEGIN
  DELETE FROM key_value_temporary
  WHERE created_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;


SELECT cron.schedule(
  'delete_key_value_old_rows_job',
  '0 0 * * *',
  $$ SELECT delete_key_value_old_rows(); $$
);
