-- Migration: Populate auth_user_id in users table
-- Date: 2025-10-23
-- Purpose: Link existing users with auth.users by matching email/username

-- This migration will populate auth_user_id for users that don't have it yet
-- It matches users.username with auth.users.email

-- Step 1: Show users without auth_user_id
DO $$
BEGIN
    RAISE NOTICE 'Users without auth_user_id:';
END $$;

SELECT 
    u.id,
    u.username,
    u.employee_id,
    u.auth_user_id
FROM users u
WHERE u.auth_user_id IS NULL
  AND u.deleted_at IS NULL;

-- Step 2: Update users.auth_user_id by matching username with email
-- IMPORTANT: Review the results before running this!
-- This assumes username matches the email (e.g., username = email or username@domain)

UPDATE users u
SET auth_user_id = au.id
FROM auth.users au
WHERE u.auth_user_id IS NULL
  AND u.deleted_at IS NULL
  AND (
    au.email = u.username 
    OR au.email LIKE u.username || '%'
    OR au.email LIKE '%' || u.username || '%'
  );

-- Step 3: Verify the update
DO $$
BEGIN
    RAISE NOTICE 'Updated users with auth_user_id:';
END $$;

SELECT 
    u.id,
    u.username,
    u.auth_user_id,
    au.email
FROM users u
JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.deleted_at IS NULL;

-- Step 4: Check for remaining users without auth_user_id
DO $$
DECLARE
    remaining_count INT;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM users
    WHERE auth_user_id IS NULL
      AND deleted_at IS NULL;
    
    IF remaining_count > 0 THEN
        RAISE WARNING 'Still have % users without auth_user_id - need manual linking!', remaining_count;
    ELSE
        RAISE NOTICE 'All active users now have auth_user_id linked!';
    END IF;
END $$;

-- Step 5: Show unlinked users for manual review
SELECT 
    u.id,
    u.username,
    u.employee_id,
    'NO AUTH USER' as status
FROM users u
WHERE u.auth_user_id IS NULL
  AND u.deleted_at IS NULL;
