-- Create user_devices table for device management
CREATE TABLE IF NOT EXISTS user_devices (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id VARCHAR(100) UNIQUE NOT NULL,
  device_name VARCHAR(255) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create index for faster lookups
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX idx_user_devices_deleted_at ON user_devices(deleted_at);

-- Add comment
COMMENT ON TABLE user_devices IS 'Stores registered devices for each user';
COMMENT ON COLUMN user_devices.user_id IS 'Reference to auth.users table (UUID)';
COMMENT ON COLUMN user_devices.device_id IS 'Unique device fingerprint hash';
COMMENT ON COLUMN user_devices.device_name IS 'User-friendly device name';
COMMENT ON COLUMN user_devices.is_active IS 'FALSE if device is blocked';
COMMENT ON COLUMN user_devices.deleted_at IS 'Soft delete timestamp';
