
-- This function helps with debugging by returning user data
-- Run this in the Supabase SQL editor to create the function
CREATE OR REPLACE FUNCTION debug_get_user_by_email(user_email text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result json;
BEGIN
  -- Try to get data from usuarios table
  SELECT json_build_object(
    'table', 'usuarios',
    'data', (SELECT json_agg(u) FROM usuarios u WHERE u.email = user_email)
  ) INTO result;
  
  -- If no data found, try users table
  IF result->'data' IS NULL OR result->'data' = 'null' THEN
    SELECT json_build_object(
      'table', 'users',
      'data', (SELECT json_agg(u) FROM users u WHERE u.email = user_email)
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$;

