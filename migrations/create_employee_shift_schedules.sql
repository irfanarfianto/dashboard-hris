-- Migration: Create employee_shift_schedules table
-- Purpose: Support rolling shift schedules for shift workers
-- Date: 2025-10-19

-- ==============================================================================
-- RATIONALE: Hybrid Shift System
-- ==============================================================================
-- 
-- Office Workers (Shift Tetap):
--   → Gunakan employees.shift_id (default shift, tidak berubah)
--   → Tidak perlu entry di employee_shift_schedules
--
-- Shift Workers (Shift Rolling):
--   → employees.shift_id = default shift (fallback)
--   → Jadwal aktual di employee_shift_schedules per tanggal
--
-- Priority Logic:
--   1. Cek employee_shift_schedules untuk tanggal tertentu
--   2. Jika tidak ada, pakai employees.shift_id (default)
-- ==============================================================================

-- ==============================================================================
-- STEP 1: Create employee_shift_schedules table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS employee_shift_schedules (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id INT NOT NULL REFERENCES work_shifts(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    notes TEXT,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- Soft Delete
    
    -- Constraint: 1 employee dapat memiliki max 1 shift per tanggal
    CONSTRAINT unique_employee_date UNIQUE(employee_id, date)
);

-- Add comments for documentation
COMMENT ON TABLE employee_shift_schedules IS 'Jadwal shift per karyawan per tanggal. Untuk shift workers dengan jadwal rolling/berubah-ubah.';
COMMENT ON COLUMN employee_shift_schedules.employee_id IS 'ID karyawan yang dijadwalkan';
COMMENT ON COLUMN employee_shift_schedules.shift_id IS 'ID shift untuk tanggal tersebut';
COMMENT ON COLUMN employee_shift_schedules.date IS 'Tanggal berlaku jadwal shift';
COMMENT ON COLUMN employee_shift_schedules.notes IS 'Catatan tambahan (opsional)';
COMMENT ON COLUMN employee_shift_schedules.created_by IS 'User yang membuat schedule (HR/Manager)';

-- ==============================================================================
-- STEP 2: Create indexes for performance
-- ==============================================================================

-- Index untuk query berdasarkan employee + date (most common query)
CREATE INDEX idx_employee_shift_schedule_emp_date 
ON employee_shift_schedules(employee_id, date) 
WHERE deleted_at IS NULL;

-- Index untuk query berdasarkan date range (calendar view)
CREATE INDEX idx_shift_schedule_date_range 
ON employee_shift_schedules(date) 
WHERE deleted_at IS NULL;

-- Index untuk query berdasarkan shift_id (cari siapa saja yang shift X)
CREATE INDEX idx_shift_schedule_shift_id 
ON employee_shift_schedules(shift_id) 
WHERE deleted_at IS NULL;

-- Index untuk soft delete
CREATE INDEX idx_shift_schedule_deleted 
ON employee_shift_schedules(deleted_at);

-- ==============================================================================
-- STEP 3: Create helper function to get shift on specific date
-- ==============================================================================

CREATE OR REPLACE FUNCTION get_employee_shift_on_date(
  emp_id INT,
  target_date DATE
)
RETURNS INT AS $$
DECLARE
  scheduled_shift_id INT;
  default_shift_id INT;
BEGIN
  -- 1. Cek apakah ada jadwal khusus untuk tanggal ini (PRIORITY 1)
  SELECT shift_id INTO scheduled_shift_id
  FROM employee_shift_schedules
  WHERE employee_id = emp_id
    AND date = target_date
    AND deleted_at IS NULL
  LIMIT 1;
  
  -- 2. Jika ada schedule spesifik, return shift dari schedule
  IF scheduled_shift_id IS NOT NULL THEN
    RETURN scheduled_shift_id;
  END IF;
  
  -- 3. Jika tidak ada schedule, return default shift dari employees (FALLBACK)
  SELECT shift_id INTO default_shift_id
  FROM employees
  WHERE id = emp_id
    AND deleted_at IS NULL;
  
  RETURN default_shift_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_employee_shift_on_date IS 'Mendapatkan shift_id karyawan pada tanggal tertentu. Priority: scheduled shift > default shift dari employees table.';

-- ==============================================================================
-- STEP 4: Create helper function to get shift with details
-- ==============================================================================

CREATE OR REPLACE FUNCTION get_employee_shift_details_on_date(
  emp_id INT,
  target_date DATE
)
RETURNS TABLE (
  shift_id INT,
  shift_name VARCHAR(100),
  start_time TIME,
  end_time TIME,
  is_scheduled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ess.shift_id, e.shift_id) as shift_id,
    ws.name as shift_name,
    ws.start_time,
    ws.end_time,
    (ess.shift_id IS NOT NULL) as is_scheduled
  FROM employees e
  LEFT JOIN employee_shift_schedules ess 
    ON ess.employee_id = e.id 
    AND ess.date = target_date 
    AND ess.deleted_at IS NULL
  JOIN work_shifts ws 
    ON ws.id = COALESCE(ess.shift_id, e.shift_id)
  WHERE e.id = emp_id
    AND e.deleted_at IS NULL
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_employee_shift_details_on_date IS 'Mendapatkan detail shift lengkap (nama, jam) untuk karyawan pada tanggal tertentu. Mengembalikan is_scheduled=true jika dari schedule, false jika default.';

-- ==============================================================================
-- EXAMPLE USAGE QUERIES
-- ==============================================================================

-- Get shift ID karyawan pada tanggal tertentu:
-- SELECT get_employee_shift_on_date(123, '2025-10-20');

-- Get shift details lengkap:
-- SELECT * FROM get_employee_shift_details_on_date(123, '2025-10-20');

-- Get semua karyawan dengan shift mereka hari ini:
-- SELECT 
--   e.id,
--   e.full_name,
--   get_employee_shift_on_date(e.id, CURRENT_DATE) as shift_id,
--   ws.name as shift_name,
--   ws.start_time,
--   ws.end_time
-- FROM employees e
-- JOIN work_shifts ws ON ws.id = get_employee_shift_on_date(e.id, CURRENT_DATE)
-- WHERE e.deleted_at IS NULL;

-- Get jadwal shift karyawan untuk 1 minggu ke depan:
-- SELECT 
--   date_series.date,
--   get_employee_shift_on_date(123, date_series.date) as shift_id,
--   ws.name as shift_name
-- FROM generate_series(
--   CURRENT_DATE,
--   CURRENT_DATE + INTERVAL '6 days',
--   INTERVAL '1 day'
-- ) AS date_series(date)
-- LEFT JOIN work_shifts ws ON ws.id = get_employee_shift_on_date(123, date_series.date);

-- ==============================================================================
-- STEP 5: Create trigger to update updated_at
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_employee_shift_schedule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shift_schedule_timestamp
BEFORE UPDATE ON employee_shift_schedules
FOR EACH ROW
EXECUTE FUNCTION update_employee_shift_schedule_timestamp();

-- ==============================================================================
-- STEP 6: Grant permissions (adjust based on your roles)
-- ==============================================================================

-- Grant access to authenticated users
-- GRANT SELECT ON employee_shift_schedules TO authenticated;
-- GRANT ALL ON employee_shift_schedules TO service_role;

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================

-- Verify table creation:
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'employee_shift_schedules';

-- Verify function creation:
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_name LIKE '%employee_shift%';
