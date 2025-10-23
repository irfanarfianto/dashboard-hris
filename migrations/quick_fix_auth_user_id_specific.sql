-- Quick Fix: Update auth_user_id for specific user
-- Run this in Supabase SQL Editor

-- Step 1: Check current user data
SELECT 
    u.id,
    u.employee_id,
    u.username,
    u.auth_user_id,
    u.is_password_changed
FROM users u
WHERE u.deleted_at IS NULL;

-- Step 2: Check auth users
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Step 3: Manual update for your user
-- Replace '309ffd66-bf76-42f0-bf84-3f562bd1e549' with your actual auth user id
-- Replace the user id (1, 2, etc) with your users table id

-- Option A: If you know the users.id
UPDATE users 
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
WHERE id = 1;  -- Replace with your users.id

-- Option B: If you know the employee_id
UPDATE users 
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
WHERE employee_id = 8;  -- Replace with your employee_id

-- Option C: Match by email (safest)
UPDATE users u
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
FROM auth.users au
JOIN employees e ON e.email = au.email
WHERE u.employee_id = e.id
AND au.id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
AND u.deleted_at IS NULL;

-- Step 4: Verify the update
SELECT 
    u.id,
    u.employee_id,
    u.username,
    u.auth_user_id,
    u.is_password_changed,
    au.email as auth_email
FROM users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.deleted_at IS NULL;

-- Step 5: Check is_password_changed
SELECT 
    u.id,
    u.username,
    u.is_password_changed,
    CASE 
        WHEN u.is_password_changed = false THEN 'Will show dialog'
        WHEN u.is_password_changed = true THEN 'No dialog'
        ELSE 'NULL value - check this!'
    END as dialog_status
FROM users u
WHERE u.auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';
