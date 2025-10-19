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
