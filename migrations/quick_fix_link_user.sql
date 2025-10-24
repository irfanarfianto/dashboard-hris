-- QUICK FIX: Link existing auth user to users table
-- For: irfanarfianto92@gmail.com
-- Auth User ID: 309ffd66-bf76-42f0-bf84-3f562bd1e549

-- =============================================================================
-- OPTION 1: If you already have an employee record
-- =============================================================================

-- Step 1a: Find your employee (if exists)
SELECT 
    id as employee_id,
    full_name,
    email,
    phone_number
FROM employees
WHERE email = 'irfanarfianto92@gmail.com'
   OR email ILIKE '%irfan%'
  AND deleted_at IS NULL;

-- Step 1b: Get available roles
SELECT id, name, description FROM roles ORDER BY id;

-- Step 1c: Insert user record linking to employee
-- ⚠️ REPLACE THESE VALUES:
-- - employee_id: from Step 1a result
-- - role_id: 1=Super Admin, 2=HR Admin, 3=Manager, 4=Employee (choose from Step 1b)

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
    '309ffd66-bf76-42f0-bf84-3f562bd1e549',  -- Your auth_user_id
    1,  -- ⚠️ REPLACE: employee_id from Step 1a
    'irfanarfianto92@gmail.com',  -- username (same as email)
    1,  -- ⚠️ REPLACE: role_id (1=Super Admin recommended for first user)
    true,  -- is_active
    true,  -- is_password_changed (set true if you already have password)
    NOW()
);
*/

-- =============================================================================
-- OPTION 2: If you DON'T have an employee record yet
-- =============================================================================

-- You need to create employee first, then link to user
-- Get company, department, position IDs first:

-- Step 2a: Get company_id
SELECT id, name FROM companies WHERE deleted_at IS NULL ORDER BY id LIMIT 5;

-- Step 2b: Get department_id
SELECT id, name FROM departments WHERE deleted_at IS NULL ORDER BY id LIMIT 10;

-- Step 2c: Get position_id
SELECT id, name FROM positions WHERE deleted_at IS NULL ORDER BY id LIMIT 10;

-- Step 2d: Get role_id
SELECT id, name FROM roles ORDER BY id;

-- Step 2e: Create employee
-- ⚠️ REPLACE VALUES from steps 2a, 2b, 2c above

/*
INSERT INTO employees (
    company_id,
    department_id,
    position_id,
    full_name,
    email,
    phone_number,
    gender,
    birth_date,
    hire_date,
    created_at
) VALUES (
    1,  -- ⚠️ REPLACE: company_id from Step 2a
    1,  -- ⚠️ REPLACE: department_id from Step 2b
    1,  -- ⚠️ REPLACE: position_id from Step 2c
    'Irfan Arfianto',  -- ⚠️ REPLACE: Your full name
    'irfanarfianto92@gmail.com',  -- Your email
    '08123456789',  -- ⚠️ REPLACE: Your phone
    'L',  -- Gender: 'L'=Laki-laki, 'P'=Perempuan
    '1992-01-01',  -- ⚠️ REPLACE: Your birth date (YYYY-MM-DD)
    CURRENT_DATE,  -- Hire date = today
    NOW()
) RETURNING id;
*/

-- Step 2f: Create user linking to new employee
-- ⚠️ Use employee_id from Step 2e RETURNING result

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
    '309ffd66-bf76-42f0-bf84-3f562bd1e549',
    999,  -- ⚠️ REPLACE: employee_id from Step 2e
    'irfanarfianto92@gmail.com',
    1,  -- ⚠️ REPLACE: role_id (1=Super Admin recommended)
    true,
    true,
    NOW()
);
*/

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- After running one of the options, verify the complete link:
SELECT 
    'auth.users' as source,
    au.id as auth_user_id,
    au.email,
    u.id as user_id,
    u.username,
    u.employee_id,
    e.full_name,
    r.name as role_name,
    u.is_active,
    u.is_password_changed
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
LEFT JOIN employees e ON e.id = u.employee_id
LEFT JOIN roles r ON r.id = u.role_id
WHERE au.email = 'irfanarfianto92@gmail.com';

-- Expected result should show:
-- ✅ auth_user_id: 309ffd66-bf76-42f0-bf84-3f562bd1e549
-- ✅ email: irfanarfianto92@gmail.com
-- ✅ user_id: (some number)
-- ✅ username: irfanarfianto92@gmail.com
-- ✅ employee_id: (some number)
-- ✅ full_name: Your name
-- ✅ role_name: Super Admin (or your chosen role)
-- ✅ is_active: true
-- ✅ is_password_changed: true
