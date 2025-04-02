
-- Function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable
      )
    )
    FROM information_schema.columns
    WHERE table_name = $1
    AND table_schema = 'public'
  );
END;
$$;

-- Function to create the schema function
CREATE OR REPLACE FUNCTION create_schema_function()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Create the function to get table schema
  EXECUTE '
  CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
  RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $func$
  BEGIN
    RETURN (
      SELECT json_agg(
        json_build_object(
          ''column_name'', column_name,
          ''data_type'', data_type,
          ''is_nullable'', is_nullable
        )
      )
      FROM information_schema.columns
      WHERE table_name = $1
      AND table_schema = ''public''
    );
  END;
  $func$;
  ';
  
  -- Create the debug function
  EXECUTE '
  CREATE OR REPLACE FUNCTION debug_get_user_by_email(user_email text)
  RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $func$
  DECLARE
    result json;
  BEGIN
    -- Try to get data from usuarios table
    SELECT json_build_object(
      ''table'', ''usuarios'',
      ''data'', (SELECT json_agg(u) FROM usuarios u WHERE u.email = user_email)
    ) INTO result;
    
    -- If no data found, try users table
    IF result->>''data'' IS NULL OR result->>''data'' = ''null'' THEN
      SELECT json_build_object(
        ''table'', ''users'',
        ''data'', (SELECT json_agg(u) FROM users u WHERE u.email = user_email)
      ) INTO result;
    END IF;
    
    RETURN result;
  END;
  $func$;
  ';
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating functions: %', SQLERRM;
    RETURN false;
END;
$$;

-- Call the function to create both functions
SELECT create_schema_function();
