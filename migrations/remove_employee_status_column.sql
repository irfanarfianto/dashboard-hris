-- Migration: Remove status column from employees table
-- Reason: Status should be derived from employee_contracts.contract_type
-- This eliminates redundancy and ensures single source of truth

-- ============================================================================
-- STEP 1: Drop status column from employees table
-- ============================================================================

ALTER TABLE employees 
DROP COLUMN IF EXISTS status;

-- ============================================================================
-- STEP 2: Add termination_date column (optional - for resigned/fired employees)
-- ============================================================================

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS termination_date DATE;

COMMENT ON COLUMN employees.termination_date IS 'Date when employee resigned or was terminated. NULL means employee is still active.';

-- ============================================================================
-- STEP 3: Create helper function to get employee status from contract
-- ============================================================================

CREATE OR REPLACE FUNCTION get_employee_status(emp_id INT)
RETURNS VARCHAR(20) AS $$
DECLARE
  contract_rec RECORD;
  term_date DATE;
BEGIN
  -- Check if employee has termination date
  SELECT termination_date INTO term_date
  FROM employees
  WHERE id = emp_id;
  
  -- If terminated, return TERMINATED
  IF term_date IS NOT NULL THEN
    RETURN 'TERMINATED';
  END IF;
  
  -- Get active contract (not deleted, end_date is NULL or in future)
  SELECT contract_type, end_date INTO contract_rec
  FROM employee_contracts
  WHERE employee_id = emp_id
    AND deleted_at IS NULL
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  ORDER BY start_date DESC
  LIMIT 1;
  
  -- No active contract found
  IF NOT FOUND THEN
    RETURN 'INACTIVE';
  END IF;
  
  -- Map contract_type to status
  CASE contract_rec.contract_type
    WHEN 'Probation' THEN RETURN 'PROBATION';
    WHEN 'Contract' THEN RETURN 'ACTIVE';
    WHEN 'Permanent' THEN RETURN 'ACTIVE';
    ELSE RETURN 'UNKNOWN';
  END CASE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_employee_status IS 'Returns employee status based on active contract. PROBATION for probation contracts, ACTIVE for contract/permanent, INACTIVE for no active contract, TERMINATED if termination_date is set.';

-- ============================================================================
-- EXAMPLE USAGE:
-- ============================================================================

-- Get employee with computed status:
-- SELECT 
--   id,
--   full_name,
--   get_employee_status(id) as status
-- FROM employees
-- WHERE deleted_at IS NULL;

-- Get all employees with their contracts and status:
-- SELECT 
--   e.id,
--   e.full_name,
--   get_employee_status(e.id) as status,
--   ec.contract_type,
--   ec.start_date,
--   ec.end_date,
--   ec.salary_base
-- FROM employees e
-- LEFT JOIN employee_contracts ec ON ec.employee_id = e.id 
--   AND ec.deleted_at IS NULL
--   AND (ec.end_date IS NULL OR ec.end_date >= CURRENT_DATE)
-- WHERE e.deleted_at IS NULL
-- ORDER BY e.full_name;
