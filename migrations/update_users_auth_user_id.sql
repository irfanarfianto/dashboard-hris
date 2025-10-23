-- Update users table to link with Supabase Auth via auth_user_id
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
SELECT 
    u.id,
    u.employee_id,
    u.username,
    u.auth_user_id,
    u.is_password_changed,
    e.email as employee_email
FROM users u
LEFT JOIN employees e ON u.employee_id = e.id
WHERE u.deleted_at IS NULL;

-- Step 2: Update auth_user_id by matching email
-- This links users table with auth.users
UPDATE users u
SET auth_user_id = au.id
FROM auth.users au
JOIN employees e ON e.email = au.email
WHERE u.employee_id = e.id
AND u.auth_user_id IS NULL
AND u.deleted_at IS NULL;

-- Step 3: Verify the update
SELECT 
    u.id,
    u.employee_id,
    u.username,
    u.auth_user_id,
    u.is_password_changed,
    au.email as auth_email,
    e.email as employee_email
FROM users u
LEFT JOIN employees e ON u.employee_id = e.id
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.deleted_at IS NULL;

-- Expected result: auth_user_id should be filled for all users
-- auth_email and employee_email should match
