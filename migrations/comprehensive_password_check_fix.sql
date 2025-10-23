-- Comprehensive Check and Fix for Password Change Dialog
-- Run each step one by one in Supabase SQL Editor

-- ============================================================================
-- STEP 1: CHECK AUTH USER
-- ============================================================================
-- Check if auth user exists
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';

-- Expected: Should return 1 row with email


-- ============================================================================
-- STEP 2: CHECK EMPLOYEE
-- ============================================================================
-- Find employee with matching email
SELECT 
    e.id as employee_id,
    e.full_name,
    e.email,
    e.status
FROM employees e
WHERE e.email IN (
    SELECT email FROM auth.users 
    WHERE id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
)
AND e.deleted_at IS NULL;

-- Expected: Should return employee with id=8


-- ============================================================================
-- STEP 3: CHECK USERS TABLE
-- ============================================================================
-- Check current state of users table
SELECT 
    u.id as user_id,
    u.employee_id,
    u.username,
    u.auth_user_id,
    u.is_password_changed,
    u.is_active
FROM users u
WHERE u.employee_id IN (
    SELECT e.id FROM employees e
    WHERE e.email IN (
        SELECT email FROM auth.users 
        WHERE id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
    )
)
AND u.deleted_at IS NULL;

-- Expected: Should show user with auth_user_id NULL or incorrect


-- ============================================================================
-- STEP 4: FIX - UPDATE auth_user_id
-- ============================================================================
-- Update auth_user_id for this specific user
UPDATE users u
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
FROM employees e
WHERE u.employee_id = e.id
AND e.email IN (
    SELECT email FROM auth.users 
    WHERE id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
)
AND u.deleted_at IS NULL
AND u.auth_user_id IS NULL;  -- Only update if NULL

-- Should return: UPDATE 1


-- ============================================================================
-- STEP 5: VERIFY UPDATE
-- ============================================================================
-- Verify auth_user_id is now set
SELECT 
    u.id as user_id,
    u.employee_id,
    u.username,
    u.auth_user_id,
    u.is_password_changed,
    u.is_active,
    au.email as auth_email,
    e.email as employee_email
FROM users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
LEFT JOIN employees e ON u.employee_id = e.id
WHERE u.auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
AND u.deleted_at IS NULL;

-- Expected output:
-- user_id | employee_id | username | auth_user_id | is_password_changed | auth_email | employee_email
-- --------|-------------|----------|--------------|---------------------|------------|---------------
-- X       | 8           | email    | 309ff...     | false/true          | email      | email (same)


-- ============================================================================
-- STEP 6: CHECK is_password_changed VALUE
-- ============================================================================
SELECT 
    u.id,
    u.username,
    u.is_password_changed,
    CASE 
        WHEN u.is_password_changed IS NULL THEN '❌ NULL - Set to FALSE!'
        WHEN u.is_password_changed = false THEN '✅ FALSE - Dialog WILL show'
        WHEN u.is_password_changed = true THEN '✅ TRUE - Dialog will NOT show'
    END as status
FROM users u
WHERE u.auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';


-- ============================================================================
-- STEP 7: (OPTIONAL) SET is_password_changed = FALSE for Testing
-- ============================================================================
-- If you want to test the password change dialog, set to false
UPDATE users
SET is_password_changed = false
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';

-- Verify
SELECT username, is_password_changed 
FROM users 
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';


-- ============================================================================
-- STEP 8: TEST QUERY (Same as code)
-- ============================================================================
-- This is the exact query that checkPasswordChanged() runs
SELECT is_password_changed, id
FROM users
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
AND deleted_at IS NULL;

-- Expected: Should return 1 row
-- If returns 0 rows → auth_user_id not set correctly
-- If returns 1 row → Check is_password_changed value


-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If STEP 8 returns 0 rows, check:

-- A. Is auth_user_id set?
SELECT * FROM users WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';

-- B. Is there any user for this employee?
SELECT * FROM users WHERE employee_id = 8 AND deleted_at IS NULL;

-- C. Are there orphaned users?
SELECT * FROM users WHERE employee_id IS NULL AND deleted_at IS NULL;

-- D. Check RLS policies
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'users';
