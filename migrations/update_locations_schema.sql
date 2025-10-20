-- Update location_wifi column names to match the application
-- Change ssid_name to ssid_name and mac_address to mac_address for consistency

ALTER TABLE location_wifi 
RENAME COLUMN ssid_name TO ssid_name;

ALTER TABLE location_wifi 
RENAME COLUMN mac_address TO mac_address;

-- Add updated_at column to locations table (if not exists)
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add updated_at column to location_wifi table (if not exists)
ALTER TABLE location_wifi 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on company_id for better query performance
CREATE INDEX IF NOT EXISTS idx_locations_company_id ON locations(company_id);

-- Create index on location_id for better query performance
CREATE INDEX IF NOT EXISTS idx_location_wifi_location_id ON location_wifi(location_id);

-- Add unique constraint to prevent duplicate mac_address per location
ALTER TABLE location_wifi 
ADD CONSTRAINT IF NOT EXISTS unique_location_bssid UNIQUE(location_id, mac_address);
