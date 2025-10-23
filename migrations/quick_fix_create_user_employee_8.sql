-- QUICK FIX: Create user for employee_id = 8
-- Copy dan paste script ini ke Supabase SQL Editor

-- Create user record
INSERT INTO users (
    employee_id,
    username,
    role_id,
    is_password_changed,
    is_active
)
SELECT 
    8,              -- employee_id
    e.email,        -- username dari email employee
    2,              -- role_id: 2 = User, 1 = Admin
    false,          -- Harus ganti password pertama kali login
    true            -- Active
FROM employees e
WHERE e.id = 8
AND NOT EXISTS (
    SELECT 1 FROM users WHERE employee_id = 8
);

-- Verify
SELECT 
    u.id,
    u.username,
    u.is_password_changed,
    e.full_name
FROM users u
JOIN employees e ON u.employee_id = e.id
WHERE u.employee_id = 8;
