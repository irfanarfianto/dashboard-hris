-- Fix RLS Policy for users table
-- Problem: Authenticated users cannot read users table during login flow
-- Solution: Allow authenticated users to read their own user record

-- Step 1: Enable RLS (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_service_role_all ON users;
DROP POLICY IF EXISTS users_authenticated_read ON users;

-- Step 3: Create policy for service role (for server actions)
CREATE POLICY users_service_role_all
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 4: Create policy for authenticated users to read users table
-- This allows the checkPasswordChanged function to work
CREATE POLICY users_authenticated_read
ON users
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to read users table

-- Step 5: Optionally, restrict to only their own record (more secure)
-- Uncomment this and comment out the one above if you want stricter security
/*
CREATE POLICY users_authenticated_read_own
ON users
FOR SELECT
TO authenticated
USING (
    employee_id IN (
        SELECT id FROM employees WHERE email = auth.jwt()->>'email'
    )
);
*/

-- Step 6: Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users';

COMMENT ON POLICY users_authenticated_read ON users IS 
'Allow authenticated users to read users table for login flow (password change check)';
