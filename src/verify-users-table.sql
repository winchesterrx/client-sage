
-- Verify if the users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- Check if the master user exists
SELECT * FROM users WHERE email = 'master@sistema.com';

-- If the table doesn't exist or is incorrectly set up, you can run the following:
/*
-- Create the users table
CREATE TABLE IF NOT EXISTS users (
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

-- Insert the master user
INSERT INTO users (name, email, password, role, invitation_status, active)
VALUES ('Master Admin', 'master@sistema.com', '1930', 'master', 'accepted', TRUE)
ON CONFLICT (email) DO NOTHING;
*/
