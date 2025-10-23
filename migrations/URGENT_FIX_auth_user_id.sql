-- CRITICAL FIX: Update auth_user_id for your user
-- Copy dan paste ke Supabase SQL Editor

-- Step 1: Verify your auth user exists
SELECT id, email, created_at
FROM auth.users
WHERE id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';
-- Expected: 1 row dengan email Anda

-- Step 2: Check current users table
SELECT 
    u.id,
    u.employee_id,
    u.username,
    u.auth_user_id,
    u.is_password_changed
FROM users u
WHERE u.employee_id = 8
AND u.deleted_at IS NULL;
-- Expected: 1 row, auth_user_id probably NULL

-- Step 3: UPDATE auth_user_id (CRITICAL!)
UPDATE users
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
WHERE employee_id = 8
AND deleted_at IS NULL;
-- Expected: UPDATE 1

-- Step 4: Verify update
SELECT 
    u.id,
    u.employee_id,
    u.username,
    u.auth_user_id,
    u.is_password_changed,
    au.email
FROM users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';
-- Expected: 1 row dengan auth_user_id filled dan email match

-- Step 5: Set is_password_changed to false for testing
UPDATE users
SET is_password_changed = false
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';
-- Expected: UPDATE 1

-- Step 6: Final verification - This is the exact query from code
SELECT id, is_password_changed, auth_user_id
FROM users
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
AND deleted_at IS NULL;
-- Expected: 1 row with is_password_changed = false
-- If this returns 0 rows, dialog will NOT show!
