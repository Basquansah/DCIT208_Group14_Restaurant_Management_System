GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO service_role;

DO $$
DECLARE
  users_id_sequence TEXT;
BEGIN
  users_id_sequence := pg_get_serial_sequence('public.users', 'id');
  IF users_id_sequence IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO service_role', users_id_sequence);
  END IF;
END;
$$;
