-- ============================================
-- PASSWORD CHANGE AFTER PIN - DATABASE SETUP
-- ============================================

-- Step 1: Verify current user data
SELECT 
  id,
  employee_id,
  username,
  auth_user_id,
  is_password_changed,
  deleted_at
FROM users
WHERE employee_id = 8; -- Ganti dengan employee_id Anda

-- Expected result: Should show 1 row with your user data

-- Step 2: Populate auth_user_id (if NULL)
-- Ganti UUID dengan auth_user_id Anda dari auth.users
UPDATE users
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
WHERE employee_id = 8
AND deleted_at IS NULL;

-- Verify update
SELECT 
  id,
  employee_id,
  auth_user_id,
  is_password_changed
FROM users
WHERE employee_id = 8;

-- Step 3: Set is_password_changed to false (for testing)
UPDATE users
SET is_password_changed = false
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
AND deleted_at IS NULL;

-- Verify the flag
SELECT 
  id,
  employee_id,
  username,
  auth_user_id,
  is_password_changed
FROM users
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';

-- Expected result:
-- auth_user_id: 309ffd66-bf76-42f0-bf84-3f562bd1e549
-- is_password_changed: false

-- ============================================
-- RLS POLICY CHECK
-- ============================================

-- Step 4: Verify RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Should see:
-- 1. users_authenticated_read (SELECT)
-- 2. users_service_role_all (ALL)

-- Step 5: Test query that component will use
SELECT id, is_password_changed, auth_user_id
FROM users
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
AND deleted_at IS NULL;

-- Expected result: 1 row with is_password_changed = false

-- ============================================
-- TESTING FLOW
-- ============================================

-- Test 1: Dialog should show
-- Prerequisites:
-- - auth_user_id populated
-- - is_password_changed = false
-- Expected: Dialog shows after PIN verify

-- Test 2: After password change
-- Run after user changes password
SELECT 
  id,
  employee_id,
  username,
  is_password_changed,
  updated_at
FROM users
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';

-- Expected result: is_password_changed = true

-- ============================================
-- RESET FOR TESTING
-- ============================================

-- To test again, reset the flag:
UPDATE users
SET is_password_changed = false
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';

-- ============================================
-- CLEANUP / ROLLBACK
-- ============================================

-- If you want to revert changes:
UPDATE users
SET is_password_changed = true
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';
