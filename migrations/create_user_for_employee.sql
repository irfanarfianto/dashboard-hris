-- Create user record for employee_id = 8
-- Run this in Supabase SQL Editor

-- Step 1: Check employee data
SELECT 
    id as employee_id,
    full_name,
    email,
    status
FROM employees 
WHERE id = 8
AND deleted_at IS NULL;

-- Step 2: Check if user already exists (should be empty)
SELECT * FROM users WHERE employee_id = 8;

-- Step 3: Get available roles
SELECT id, name FROM roles WHERE deleted_at IS NULL;

-- Step 4: Create user record for employee_id = 8
INSERT INTO users (
    employee_id,
    username,
    role_id,
    is_password_changed,
    is_active,
    created_at
)
SELECT 
    e.id,                       -- employee_id = 8
    e.email,                    -- username (sama dengan email)
    2,                          -- role_id (2 = User biasa, 1 = Admin, sesuaikan)
    false,                      -- Harus ganti password saat pertama login
    true,                       -- Active
    NOW()
FROM employees e
WHERE e.id = 8
AND e.deleted_at IS NULL
AND NOT EXISTS (
    SELECT 1 FROM users WHERE employee_id = 8
);

-- Step 5: Verify user created
SELECT 
    u.id as user_id,
    u.username,
    u.is_password_changed,
    u.is_active,
    e.full_name,
    e.email as employee_email,
    r.name as role_name
FROM users u
JOIN employees e ON u.employee_id = e.id
JOIN roles r ON u.role_id = r.id
WHERE u.employee_id = 8;

-- Expected output:
-- user_id | username | is_password_changed | is_active | full_name | employee_email | role_name
-- --------|----------|---------------------|-----------|-----------|----------------|----------
-- X       | email    | false               | true      | Name      | email          | User
