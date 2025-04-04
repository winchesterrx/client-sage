
-- Create a function that allows creating users by bypassing RLS
CREATE OR REPLACE FUNCTION create_new_user(
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_password VARCHAR(255),
  user_role VARCHAR(20),
  user_invitation_status VARCHAR(20)
)
RETURNS SETOF usuarios
LANGUAGE plpgsql
SECURITY DEFINER -- This means the function runs with the privileges of the creator
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO usuarios (
    name, 
    email, 
    password, 
    role, 
    invitation_status, 
    active
  )
  VALUES (
    user_name, 
    user_email, 
    user_password, 
    user_role, 
    user_invitation_status, 
    FALSE
  )
  RETURNING *;
END;
$$;

-- Alternatively, you can modify the RLS policies for anonymous users
-- Modify the insert policy for anonymous users
DROP POLICY IF EXISTS "Enable insert access for anonymous users" ON usuarios;
CREATE POLICY "Enable insert access for anonymous users" 
ON usuarios FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Make sure RLS is enabled
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
