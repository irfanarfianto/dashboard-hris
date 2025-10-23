-- Migration: Add auth_user_id to users table
-- Date: 2025-10-19
-- Purpose: Link custom users table to Supabase auth.users

-- 1. Add auth_user_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- 2. Add foreign key constraint to auth.users
ALTER TABLE users 
ADD CONSTRAINT fk_users_auth_user 
FOREIGN KEY (auth_user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- 4. Make employee_id nullable (for admin/HR without employee record)
ALTER TABLE users 
ALTER COLUMN employee_id DROP NOT NULL;

-- 5. Make password_hash nullable (optional if using full Supabase Auth)
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- 6. Add comment
COMMENT ON COLUMN users.auth_user_id IS 'Reference to Supabase auth.users - handles actual authentication';
COMMENT ON COLUMN users.employee_id IS 'Reference to employees - nullable for admin/HR users';
COMMENT ON COLUMN users.password_hash IS 'Optional - can be removed if using full Supabase Auth';

-- 7. Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policy for authenticated users to read users table
-- This allows checkPasswordChanged() to work during login
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_authenticated_read ON users;
CREATE POLICY users_authenticated_read
ON users
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to read

-- 9. Create RLS policy for service role (full access via server actions)
-- Service role bypasses RLS by default, but we define it explicitly
DROP POLICY IF EXISTS users_service_role_all ON users;
CREATE POLICY users_service_role_all
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
