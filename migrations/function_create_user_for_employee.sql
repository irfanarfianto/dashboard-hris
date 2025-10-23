-- Stored Function: Auto-create user for employee
-- This function will automatically create a user record for an employee
-- Usage: SELECT create_user_for_employee(8, 2); -- employee_id, role_id

CREATE OR REPLACE FUNCTION create_user_for_employee(
    p_employee_id INT,
    p_role_id INT DEFAULT 2  -- Default role = User (2)
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    user_id INT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_email VARCHAR;
    v_user_id INT;
BEGIN
    -- Check if employee exists
    SELECT email INTO v_email
    FROM employees
    WHERE id = p_employee_id
    AND deleted_at IS NULL;
    
    IF v_email IS NULL THEN
        RETURN QUERY SELECT false, 'Employee not found or deleted', NULL::INT;
        RETURN;
    END IF;
    
    -- Check if user already exists
    SELECT id INTO v_user_id
    FROM users
    WHERE employee_id = p_employee_id
    AND deleted_at IS NULL;
    
    IF v_user_id IS NOT NULL THEN
        RETURN QUERY SELECT false, 'User already exists for this employee', v_user_id;
        RETURN;
    END IF;
    
    -- Check if role exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_role_id AND deleted_at IS NULL) THEN
        RETURN QUERY SELECT false, 'Role not found', NULL::INT;
        RETURN;
    END IF;
    
    -- Create user
    INSERT INTO users (
        employee_id,
        username,
        role_id,
        is_password_changed,
        is_active,
        created_at
    ) VALUES (
        p_employee_id,
        v_email,
        p_role_id,
        false,  -- Force password change on first login
        true,
        NOW()
    )
    RETURNING id INTO v_user_id;
    
    RETURN QUERY SELECT true, 'User created successfully', v_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_for_employee TO authenticated;

-- Example usage:
-- Create user for employee_id = 8 with role User (2)
-- SELECT * FROM create_user_for_employee(8, 2);

-- Create user for employee_id = 8 with role Admin (1)
-- SELECT * FROM create_user_for_employee(8, 1);
