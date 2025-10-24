-- ==============================================================================
-- ATTENDANCE FEATURES MIGRATION
-- Date: 2025-10-23
-- Description: Add overtime tracking and attendance reports features
-- ==============================================================================

-- 1. Create Overtime Records Table
CREATE TABLE IF NOT EXISTS overtime_records (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_id INT REFERENCES attendances(id) ON DELETE SET NULL,
    overtime_date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_hours DECIMAL(5,2) NOT NULL,
    multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.5, -- 1.5x untuk overtime biasa, 2x untuk weekend/holiday
    total_compensation DECIMAL(12,2), -- Calculated: duration * hourly_rate * multiplier
    reason TEXT,
    status approval_status_enum NOT NULL DEFAULT 'Pending',
    approver_id INT REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

-- 2. Create Overtime Rules Table
CREATE TABLE IF NOT EXISTS overtime_rules (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    weekday_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.5,
    weekend_multiplier DECIMAL(3,2) NOT NULL DEFAULT 2.0,
    holiday_multiplier DECIMAL(3,2) NOT NULL DEFAULT 2.0,
    min_overtime_minutes INT NOT NULL DEFAULT 30, -- Minimum overtime to be counted
    max_overtime_hours_per_day DECIMAL(4,2) DEFAULT 4.0,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    auto_calculate BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

-- 3. Create Attendance Reports Table (for cached/generated reports)
CREATE TABLE IF NOT EXISTS attendance_reports (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    report_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_employees INT NOT NULL DEFAULT 0,
    total_present INT NOT NULL DEFAULT 0,
    total_late INT NOT NULL DEFAULT 0,
    total_absent INT NOT NULL DEFAULT 0,
    total_leave INT NOT NULL DEFAULT 0,
    total_overtime_hours DECIMAL(10,2) DEFAULT 0,
    report_data JSONB, -- Store detailed report data
    generated_by INT REFERENCES users(id),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_overtime_records_employee_date 
    ON overtime_records(employee_id, overtime_date);

CREATE INDEX IF NOT EXISTS idx_overtime_records_status 
    ON overtime_records(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_overtime_records_date_range 
    ON overtime_records(overtime_date) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_reports_company_type_date 
    ON attendance_reports(company_id, report_type, report_date);

CREATE INDEX IF NOT EXISTS idx_attendances_employee_date 
    ON attendances(employee_id, check_in);

CREATE INDEX IF NOT EXISTS idx_attendances_location 
    ON attendances(location_id) WHERE deleted_at IS NULL;

-- 5. Add attendance summary columns (denormalized for performance)
ALTER TABLE attendances 
    ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS late_minutes INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(5,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS working_hours DECIMAL(5,2) DEFAULT 0;

-- 6. Create function to auto-calculate overtime
CREATE OR REPLACE FUNCTION calculate_overtime_from_attendance()
RETURNS TRIGGER AS $$
DECLARE
    shift_end TIME;
    overtime_start TIMESTAMPTZ;
    overtime_duration DECIMAL(5,2);
    employee_salary DECIMAL(12,2);
    hourly_rate DECIMAL(12,2);
    multiplier DECIMAL(3,2);
BEGIN
    -- Only calculate when check_out is set
    IF NEW.check_out IS NOT NULL AND NEW.shift_id IS NOT NULL THEN
        -- Get shift end time
        SELECT end_time INTO shift_end FROM work_shifts WHERE id = NEW.shift_id;
        
        -- Calculate overtime if check_out is after shift end time
        overtime_start := DATE(NEW.check_in) + shift_end;
        
        IF NEW.check_out > overtime_start THEN
            overtime_duration := EXTRACT(EPOCH FROM (NEW.check_out - overtime_start)) / 3600.0;
            
            -- Only record if overtime is more than 30 minutes
            IF overtime_duration >= 0.5 THEN
                -- Get employee salary for calculation
                SELECT salary_base INTO employee_salary 
                FROM employees 
                WHERE id = NEW.employee_id;
                
                -- Calculate hourly rate (assuming 173 working hours per month)
                hourly_rate := COALESCE(employee_salary, 0) / 173.0;
                
                -- Determine multiplier based on day of week
                IF EXTRACT(DOW FROM NEW.check_in) IN (0, 6) THEN
                    multiplier := 2.0; -- Weekend
                ELSE
                    multiplier := 1.5; -- Weekday
                END IF;
                
                -- Update attendance overtime hours
                NEW.overtime_hours := overtime_duration;
                
                -- Insert overtime record
                INSERT INTO overtime_records (
                    employee_id,
                    attendance_id,
                    overtime_date,
                    start_time,
                    end_time,
                    duration_hours,
                    multiplier,
                    total_compensation,
                    status
                ) VALUES (
                    NEW.employee_id,
                    NEW.id,
                    DATE(NEW.check_in),
                    overtime_start,
                    NEW.check_out,
                    overtime_duration,
                    multiplier,
                    overtime_duration * hourly_rate * multiplier,
                    'Pending'
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for auto-calculating overtime
DROP TRIGGER IF EXISTS trigger_calculate_overtime ON attendances;
CREATE TRIGGER trigger_calculate_overtime
    AFTER INSERT OR UPDATE OF check_out
    ON attendances
    FOR EACH ROW
    WHEN (NEW.check_out IS NOT NULL AND NEW.deleted_at IS NULL)
    EXECUTE FUNCTION calculate_overtime_from_attendance();

-- 8. Create function to calculate late status
CREATE OR REPLACE FUNCTION calculate_late_status()
RETURNS TRIGGER AS $$
DECLARE
    shift_start TIME;
    expected_checkin TIMESTAMPTZ;
    late_mins INT;
    tolerance INT;
BEGIN
    -- Get shift start time and tolerance
    SELECT start_time, tolerance_minutes 
    INTO shift_start, tolerance
    FROM work_shifts 
    WHERE id = NEW.shift_id;
    
    IF shift_start IS NOT NULL THEN
        expected_checkin := DATE(NEW.check_in) + shift_start;
        
        -- Calculate late minutes
        late_mins := GREATEST(0, EXTRACT(EPOCH FROM (NEW.check_in - expected_checkin)) / 60);
        
        -- Apply tolerance
        IF late_mins > tolerance THEN
            NEW.is_late := TRUE;
            NEW.late_minutes := late_mins - tolerance;
            NEW.status := 'Terlambat';
        ELSE
            NEW.is_late := FALSE;
            NEW.late_minutes := 0;
            IF NEW.status = 'Terlambat' THEN
                NEW.status := 'Hadir';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for late calculation
DROP TRIGGER IF EXISTS trigger_calculate_late ON attendances;
CREATE TRIGGER trigger_calculate_late
    BEFORE INSERT OR UPDATE OF check_in
    ON attendances
    FOR EACH ROW
    WHEN (NEW.deleted_at IS NULL AND NEW.shift_id IS NOT NULL)
    EXECUTE FUNCTION calculate_late_status();

-- 10. Add default overtime rule for existing companies
INSERT INTO overtime_rules (
    company_id,
    name,
    weekday_multiplier,
    weekend_multiplier,
    holiday_multiplier,
    min_overtime_minutes,
    max_overtime_hours_per_day,
    requires_approval,
    auto_calculate,
    is_active
)
SELECT 
    id,
    'Default Overtime Rule',
    1.5,
    2.0,
    2.0,
    30,
    4.0,
    TRUE,
    TRUE,
    TRUE
FROM companies
WHERE NOT EXISTS (
    SELECT 1 FROM overtime_rules WHERE company_id = companies.id
)
AND deleted_at IS NULL;

-- 11. Add comments for documentation
COMMENT ON TABLE overtime_records IS 'Records of employee overtime work';
COMMENT ON TABLE overtime_rules IS 'Rules for calculating overtime compensation';
COMMENT ON TABLE attendance_reports IS 'Cached attendance reports for performance';
COMMENT ON COLUMN overtime_records.multiplier IS 'Overtime pay multiplier (1.5x weekday, 2x weekend/holiday)';
COMMENT ON COLUMN overtime_records.total_compensation IS 'Calculated overtime compensation amount';
COMMENT ON COLUMN attendances.is_late IS 'Whether employee was late for this attendance';
COMMENT ON COLUMN attendances.late_minutes IS 'Minutes late after tolerance period';
COMMENT ON COLUMN attendances.overtime_hours IS 'Overtime hours worked beyond shift end time';
COMMENT ON COLUMN attendances.working_hours IS 'Total working hours (check_out - check_in)';
