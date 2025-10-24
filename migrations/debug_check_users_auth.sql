-- Debug: Check users table data
-- Run this in Supabase SQL Editor to check your users table

-- 1. Check all users with their auth_user_id
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

-- 2. Check if auth_user_id is populated
SELECT 
    COUNT(*) as total_users,
    COUNT(auth_user_id) as users_with_auth_id,
    COUNT(*) - COUNT(auth_user_id) as users_without_auth_id
FROM users
WHERE deleted_at IS NULL;

-- 3. Check auth.users table
SELECT 
    id as auth_id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there's a match between auth.users and users table
SELECT 
    au.id as auth_user_id,
    au.email,
    u.id as user_id,
    u.username,
    u.employee_id,
    u.auth_user_id as linked_auth_id,
    CASE 
        WHEN u.auth_user_id IS NULL THEN '❌ NOT LINKED'
        WHEN u.auth_user_id = au.id THEN '✅ LINKED'
        ELSE '⚠️ MISMATCH'
    END as status
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id OR au.email LIKE '%' || u.username || '%'
ORDER BY au.created_at DESC
LIMIT 10;

-- 5. Find your user by email (replace with your email)
-- Uncomment and replace YOUR_EMAIL with your actual email
/*
SELECT 
    au.id as auth_user_id,
    au.email,
    u.id as user_id,
    u.username,
    u.employee_id,
    u.auth_user_id
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
WHERE au.email = 'YOUR_EMAIL@example.com';
*/
