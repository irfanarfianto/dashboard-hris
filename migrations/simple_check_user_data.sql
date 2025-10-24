-- Simple Check: Current state of users table
-- For: irfanarfianto92@gmail.com
-- Auth User ID: 309ffd66-bf76-42f0-bf84-3f562bd1e549

-- =============================================================================
-- STEP 1: CHECK ALL USERS
-- =============================================================================

-- Show all users in users table
SELECT 
    id,
    username,
    auth_user_id,
    employee_id,
    role_id,
    is_active,
    deleted_at
FROM users
ORDER BY id;

-- =============================================================================
-- STEP 2: FIND USER BY USERNAME/EMAIL PATTERN
-- =============================================================================

-- Try to find user with similar username
SELECT 
    id,
    username,
    auth_user_id,
    employee_id,
    role_id,
    is_active
FROM users
WHERE username ILIKE '%irfan%'
   OR username = 'irfanarfianto92@gmail.com'
   OR username = 'irfanarfianto92'
ORDER BY id;

-- =============================================================================
-- STEP 3: CHECK IF EMPLOYEE EXISTS
-- =============================================================================

-- Check if there's an employee with this email
SELECT 
    id as employee_id,
    full_name,
    email,
    phone_number,
    status,
    deleted_at
FROM employees
WHERE email ILIKE '%irfan%'
   OR email = 'irfanarfianto92@gmail.com'
ORDER BY id;

-- =============================================================================
-- STEP 4: CHECK AUTH.USERS
-- =============================================================================

-- Verify auth.users entry
SELECT 
    id as auth_user_id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE email = 'irfanarfianto92@gmail.com';

-- =============================================================================
-- STEP 5: CHECK ROLES
-- =============================================================================

-- Show available roles
SELECT id, name, description
FROM roles
ORDER BY id;
