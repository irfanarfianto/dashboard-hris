-- Check and Fix User: irfanarfianto92@gmail.com
-- Auth User ID: 309ffd66-bf76-42f0-bf84-3f562bd1e549

-- Step 1: Check if user exists in users table
SELECT 
    id,
    username,
    auth_user_id,
    employee_id,
    role_id,
    is_active,
    deleted_at
FROM users
WHERE deleted_at IS NULL
ORDER BY id;

-- Step 2: Check for username that might match
SELECT 
    id,
    username,
    auth_user_id,
    employee_id,
    role_id
FROM users
WHERE (
    username LIKE '%irfan%' 
    OR username LIKE '%arfianto%'
    OR username = 'irfanarfianto92@gmail.com'
)
AND deleted_at IS NULL;

-- Step 3: Check auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'irfanarfianto92@gmail.com';

-- Step 4: If user exists in users table but auth_user_id is NULL, UPDATE it
-- Replace 'FOUND_USER_ID' with the actual user id from Step 2
/*
UPDATE users
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
WHERE id = FOUND_USER_ID  -- Replace with actual ID
  AND auth_user_id IS NULL;
*/

-- Step 5: Verify the update
SELECT 
    u.id,
    u.username,
    u.auth_user_id,
    u.employee_id,
    au.email
FROM users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.id = 1  -- Replace with actual ID
  AND u.deleted_at IS NULL;
