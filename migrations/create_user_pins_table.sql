-- Create user_pins table for PIN security
CREATE TABLE IF NOT EXISTS user_pins (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_code VARCHAR(255) NOT NULL, -- Store bcrypt hash (60 chars)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expired_at TIMESTAMP WITH TIME ZONE NULL,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create index for faster lookups
CREATE INDEX idx_user_pins_user_id ON user_pins(user_id);
CREATE INDEX idx_user_pins_deleted_at ON user_pins(deleted_at);

-- Add comment
COMMENT ON TABLE user_pins IS 'Stores user PINs (bcrypt hashed)';
COMMENT ON COLUMN user_pins.user_id IS 'Reference to auth.users table (UUID)';
COMMENT ON COLUMN user_pins.pin_code IS 'Bcrypt hashed PIN (60 characters)';
COMMENT ON COLUMN user_pins.expired_at IS 'PIN expiry date (optional)';
COMMENT ON COLUMN user_pins.deleted_at IS 'Soft delete timestamp';
