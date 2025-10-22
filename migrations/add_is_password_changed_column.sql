-- Add is_password_changed column to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS is_password_changed BOOLEAN DEFAULT TRUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_password_changed ON users(is_password_changed);

-- Update existing users (assume they have changed password)
UPDATE users 
SET is_password_changed = TRUE 
WHERE is_password_changed IS NULL;

-- Add comment
COMMENT ON COLUMN users.is_password_changed IS 'Flag to check if user has changed default password. FALSE for new users, TRUE after password change.';

-- Verification query
SELECT id, email, is_password_changed, created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
