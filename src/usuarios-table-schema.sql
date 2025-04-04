
-- Create usuarios table if it doesn't exist 
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'master', 'manager', 'user')) DEFAULT 'user',
  invitation_status VARCHAR(20) CHECK (invitation_status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  active BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security for usuarios table
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON usuarios;
DROP POLICY IF EXISTS "Enable insert access for anonymous users" ON usuarios;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON usuarios;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON usuarios;

-- Policy to allow anyone to insert new users (registration)
CREATE POLICY "Enable insert access for anonymous users" 
ON usuarios FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy to allow authenticated users to read all users
CREATE POLICY "Enable read access for all users" 
ON usuarios FOR SELECT 
TO anon, authenticated
USING (true);

-- Policy to allow authenticated users to update their own data or for admin users
CREATE POLICY "Enable update access for authenticated users" 
ON usuarios FOR UPDATE 
TO authenticated
USING (auth.uid()::text = email OR role = 'admin' OR role = 'master');

-- Set up trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_usuarios_timestamp
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
