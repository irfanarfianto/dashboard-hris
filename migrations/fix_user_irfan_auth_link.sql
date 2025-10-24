-- FIX: Link existing user to auth.users
-- For: irfanarfianto92@gmail.com
-- Auth User ID: 309ffd66-bf76-42f0-bf84-3f562bd1e549

-- =============================================================================
-- STEP 1: CHECK CURRENT STATE
-- =============================================================================

-- 1.1 Check if employee exists with this email
SELECT 
    id as employee_id,
    full_name,
    email,
    status
FROM employees
WHERE email = 'irfanarfianto92@gmail.com'
  AND deleted_at IS NULL;

-- 1.2 Check if user exists in users table
SELECT 
    id as user_id,
    username,
    auth_user_id,
    employee_id,
    role_id,
    is_active
FROM users
WHERE username = 'irfanarfianto92@gmail.com'
   OR username LIKE '%irfan%'
  AND deleted_at IS NULL;

-- 1.3 Check auth.users
SELECT 
    id as auth_user_id,
    email,
    created_at
FROM auth.users
WHERE email = 'irfanarfianto92@gmail.com';

-- =============================================================================
-- STEP 2: FIX OPTIONS (Choose based on Step 1 results)
-- =============================================================================

-- OPTION A: If user exists in users table but auth_user_id is NULL
-- Uncomment and run this if Step 1.2 shows a user with NULL auth_user_id
/*
UPDATE users
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
WHERE username = 'irfanarfianto92@gmail.com'  -- Or use: id = X (from step 1.2)
  AND auth_user_id IS NULL
  AND deleted_at IS NULL;

-- Verify
SELECT id, username, auth_user_id, employee_id
FROM users
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';
*/

-- OPTION B: If user does NOT exist in users table at all
-- Uncomment and run this if Step 1.2 shows NO results
-- Replace EMPLOYEE_ID_FROM_STEP_1 with actual employee_id from step 1.1
/*
INSERT INTO users (
    auth_user_id,
    employee_id,
    username,
    role_id,
    is_active,
    is_password_changed,
    created_at
) VALUES (
    '309ffd66-bf76-42f0-bf84-3f562bd1e549',  -- auth_user_id
    1,  -- REPLACE with actual employee_id from step 1.1
    'irfanarfianto92@gmail.com',  -- username (same as email)
    1,  -- role_id: 1=Super Admin, 2=HR Admin, 3=Manager, 4=Employee (choose appropriate)
    true,  -- is_active
    false,  -- is_password_changed (will prompt password change)
    NOW()
);

-- Verify
SELECT id, username, auth_user_id, employee_id, role_id
FROM users
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';
*/

-- OPTION C: If employee does NOT exist in employees table
-- You need to create employee first, then create user
-- See separate migration: create_employee_and_user.sql

-- =============================================================================
-- STEP 3: FINAL VERIFICATION
-- =============================================================================

-- After running one of the options above, verify the link:
SELECT 
    au.id as auth_user_id,
    au.email,
    u.id as user_id,
    u.username,
    u.employee_id,
    e.full_name,
    e.email as employee_email,
    r.name as role_name
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
LEFT JOIN employees e ON e.id = u.employee_id
LEFT JOIN roles r ON r.id = u.role_id
WHERE au.email = 'irfanarfianto92@gmail.com';

-- Expected result:
-- ✅ auth_user_id: 309ffd66-bf76-42f0-bf84-3f562bd1e549
-- ✅ user_id: (some number)
-- ✅ username: irfanarfianto92@gmail.com
-- ✅ employee_id: (some number)
-- ✅ full_name: (your name)
-- ✅ role_name: (your role)

-- =============================================================================
-- TROUBLESHOOTING
-- =============================================================================

-- If still getting errors, check:

-- 1. Check if roles table has data
SELECT id, name FROM roles ORDER BY id;

-- 2. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'employees')
ORDER BY tablename, policyname;

-- 3. Check if deleted_at is NULL
SELECT COUNT(*) 
FROM users 
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
  AND deleted_at IS NOT NULL;
-- Should return 0
