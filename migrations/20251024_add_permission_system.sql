-- Migration: Add Permission System
-- Date: 2025-10-24
-- Purpose: Implement Role-Based Access Control with Permissions

-- =============================================================================
-- STEP 1: CREATE PERMISSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,        -- e.g., 'employees', 'attendance', 'payroll'
    action VARCHAR(50) NOT NULL,        -- e.g., 'view', 'create', 'edit', 'delete', 'approve'
    name VARCHAR(100) NOT NULL UNIQUE,  -- e.g., 'employees.view', 'attendance.check-in'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Index for faster lookup
CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_name ON permissions(name);

COMMENT ON TABLE permissions IS 'Defines granular permissions for actions in the system';
COMMENT ON COLUMN permissions.module IS 'Module/feature name (employees, attendance, payroll, etc.)';
COMMENT ON COLUMN permissions.action IS 'Action type (view, create, edit, delete, approve, etc.)';
COMMENT ON COLUMN permissions.name IS 'Unique permission identifier (module.action format)';

-- =============================================================================
-- STEP 2: CREATE ROLE_PERMISSIONS JUNCTION TABLE (Many-to-Many)
-- =============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id) -- Prevent duplicate assignments
);

-- Indexes for faster joins
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

COMMENT ON TABLE role_permissions IS 'Maps roles to their allowed permissions (many-to-many)';

-- =============================================================================
-- STEP 3: INSERT PERMISSIONS (Seed Data)
-- =============================================================================

-- Profile & Dashboard Permissions (All roles)
INSERT INTO permissions (module, action, name, description) VALUES
    ('profile', 'view', 'profile.view', 'View own profile'),
    ('profile', 'edit', 'profile.edit', 'Edit own profile'),
    ('dashboard', 'view', 'dashboard.view', 'View dashboard');

-- Employee Management Permissions
INSERT INTO permissions (module, action, name, description) VALUES
    ('employees', 'view-all', 'employees.view-all', 'View all employees data'),
    ('employees', 'view-own', 'employees.view-own', 'View only own employee data'),
    ('employees', 'view-team', 'employees.view-team', 'View team employees data (for managers)'),
    ('employees', 'create', 'employees.create', 'Create new employee'),
    ('employees', 'edit', 'employees.edit', 'Edit employee data'),
    ('employees', 'delete', 'employees.delete', 'Delete/archive employee'),
    ('employees', 'export', 'employees.export', 'Export employee data');

-- Attendance Permissions
INSERT INTO permissions (module, action, name, description) VALUES
    ('attendance', 'check-in', 'attendance.check-in', 'Check-in/check-out attendance'),
    ('attendance', 'view-own', 'attendance.view-own', 'View own attendance records'),
    ('attendance', 'view-team', 'attendance.view-team', 'View team attendance records'),
    ('attendance', 'view-all', 'attendance.view-all', 'View all attendance records'),
    ('attendance', 'edit', 'attendance.edit', 'Edit attendance records'),
    ('attendance', 'approve', 'attendance.approve', 'Approve attendance adjustments'),
    ('attendance', 'export', 'attendance.export', 'Export attendance reports');

-- Leave Management Permissions
INSERT INTO permissions (module, action, name, description) VALUES
    ('leave', 'request', 'leave.request', 'Submit leave request'),
    ('leave', 'view-own', 'leave.view-own', 'View own leave records'),
    ('leave', 'view-team', 'leave.view-team', 'View team leave records'),
    ('leave', 'view-all', 'leave.view-all', 'View all leave records'),
    ('leave', 'approve', 'leave.approve', 'Approve/reject leave requests'),
    ('leave', 'cancel', 'leave.cancel', 'Cancel leave requests');

-- Payroll Permissions
INSERT INTO permissions (module, action, name, description) VALUES
    ('payroll', 'view-own', 'payroll.view-own', 'View own payroll/salary'),
    ('payroll', 'view-all', 'payroll.view-all', 'View all payroll data'),
    ('payroll', 'create', 'payroll.create', 'Create payroll records'),
    ('payroll', 'edit', 'payroll.edit', 'Edit payroll records'),
    ('payroll', 'process', 'payroll.process', 'Process payroll run'),
    ('payroll', 'export', 'payroll.export', 'Export payroll reports');

-- Shift Management Permissions
INSERT INTO permissions (module, action, name, description) VALUES
    ('shifts', 'view', 'shifts.view', 'View shift schedules'),
    ('shifts', 'create', 'shifts.create', 'Create shift schedules'),
    ('shifts', 'edit', 'shifts.edit', 'Edit shift schedules'),
    ('shifts', 'delete', 'shifts.delete', 'Delete shift schedules'),
    ('shifts', 'assign', 'shifts.assign', 'Assign shifts to employees');

-- Master Data Permissions (Companies, Departments, Positions, etc.)
INSERT INTO permissions (module, action, name, description) VALUES
    ('master-data', 'view', 'master-data.view', 'View master data'),
    ('master-data', 'create', 'master-data.create', 'Create master data'),
    ('master-data', 'edit', 'master-data.edit', 'Edit master data'),
    ('master-data', 'delete', 'master-data.delete', 'Delete master data');

-- System & Settings Permissions
INSERT INTO permissions (module, action, name, description) VALUES
    ('roles', 'view', 'roles.view', 'View roles'),
    ('roles', 'create', 'roles.create', 'Create roles'),
    ('roles', 'edit', 'roles.edit', 'Edit roles'),
    ('roles', 'delete', 'roles.delete', 'Delete roles'),
    ('settings', 'view', 'settings.view', 'View system settings'),
    ('settings', 'edit', 'settings.edit', 'Edit system settings'),
    ('audit', 'view', 'audit.view', 'View audit logs'),
    ('reports', 'view', 'reports.view', 'View reports'),
    ('reports', 'export', 'reports.export', 'Export reports');

-- =============================================================================
-- STEP 4: ASSIGN PERMISSIONS TO ROLES
-- =============================================================================

-- Get role IDs (assuming roles already exist)
DO $$
DECLARE
    role_employee_id INT;
    role_manager_id INT;
    role_hr_admin_id INT;
    role_super_admin_id INT;
BEGIN
    -- Get role IDs by name
    SELECT id INTO role_employee_id FROM roles WHERE name = 'Employee';
    SELECT id INTO role_manager_id FROM roles WHERE name = 'Manager';
    SELECT id INTO role_hr_admin_id FROM roles WHERE name = 'HR Admin';
    SELECT id INTO role_super_admin_id FROM roles WHERE name = 'Super Admin';

    -- ===========================================================================
    -- EMPLOYEE PERMISSIONS (Basic Access)
    -- ===========================================================================
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT role_employee_id, id FROM permissions WHERE name IN (
        -- Profile & Dashboard
        'profile.view',
        'profile.edit',
        'dashboard.view',
        -- Employees (only own data)
        'employees.view-own',
        -- Attendance
        'attendance.check-in',
        'attendance.view-own',
        -- Leave
        'leave.request',
        'leave.view-own',
        -- Payroll (view own)
        'payroll.view-own',
        -- Shifts (view only)
        'shifts.view'
    ) ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- ===========================================================================
    -- MANAGER PERMISSIONS (Employee + Team Management + Approval)
    -- ===========================================================================
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT role_manager_id, id FROM permissions WHERE name IN (
        -- All Employee permissions
        'profile.view',
        'profile.edit',
        'dashboard.view',
        'employees.view-own',
        'attendance.check-in',
        'attendance.view-own',
        'leave.request',
        'leave.view-own',
        'payroll.view-own',
        'shifts.view',
        -- Additional: View team data
        'employees.view-team',
        'attendance.view-team',
        'attendance.export',
        'leave.view-team',
        -- Approval permissions
        'attendance.approve',
        'leave.approve',
        'leave.cancel',
        -- Reports
        'reports.view',
        'reports.export'
    ) ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- ===========================================================================
    -- HR ADMIN PERMISSIONS (Full HR Access BUT NOT System Settings)
    -- ===========================================================================
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT role_hr_admin_id, id FROM permissions WHERE name IN (
        -- All Employee permissions
        'profile.view',
        'profile.edit',
        'dashboard.view',
        'attendance.check-in',
        'attendance.view-own',
        'leave.request',
        'leave.view-own',
        'payroll.view-own',
        -- Full Employees management
        'employees.view-all',
        'employees.view-team',
        'employees.view-own',
        'employees.create',
        'employees.edit',
        'employees.delete',
        'employees.export',
        -- Full Attendance management
        'attendance.view-all',
        'attendance.view-team',
        'attendance.edit',
        'attendance.approve',
        'attendance.export',
        -- Full Leave management
        'leave.view-all',
        'leave.view-team',
        'leave.approve',
        'leave.cancel',
        -- Full Payroll access
        'payroll.view-all',
        'payroll.create',
        'payroll.edit',
        'payroll.process',
        'payroll.export',
        -- Shift management
        'shifts.create',
        'shifts.edit',
        'shifts.delete',
        'shifts.assign',
        -- Master data
        'master-data.view',
        'master-data.create',
        'master-data.edit',
        'master-data.delete',
        -- Reports
        'reports.view',
        'reports.export',
        -- Roles (view only, no edit/delete)
        'roles.view'
    ) ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- ===========================================================================
    -- SUPER ADMIN PERMISSIONS (ALL PERMISSIONS)
    -- ===========================================================================
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT role_super_admin_id, id FROM permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;

END $$;

-- =============================================================================
-- STEP 5: CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM users u
        JOIN role_permissions rp ON rp.role_id = u.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE u.auth_user_id = p_user_id
          AND u.deleted_at IS NULL
          AND p.name = p_permission_name
          AND p.deleted_at IS NULL
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_permission IS 'Check if user has specific permission by auth_user_id';

-- Function to get all user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(permission_name VARCHAR, module VARCHAR, action VARCHAR, description TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name,
        p.module,
        p.action,
        p.description
    FROM users u
    JOIN role_permissions rp ON rp.role_id = u.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE u.auth_user_id = p_user_id
      AND u.deleted_at IS NULL
      AND p.deleted_at IS NULL
    ORDER BY p.module, p.action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_permissions IS 'Get all permissions for a user by auth_user_id';

-- =============================================================================
-- STEP 6: VERIFICATION QUERIES
-- =============================================================================

-- Check permissions count
SELECT 
    'Total Permissions' as metric,
    COUNT(*) as count
FROM permissions
WHERE deleted_at IS NULL;

-- Check role-permission assignments
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON rp.role_id = r.id
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name
ORDER BY r.id;

-- Show sample permissions per role
SELECT 
    r.name as role_name,
    p.module,
    p.action,
    p.name as permission_name
FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.deleted_at IS NULL
  AND p.deleted_at IS NULL
ORDER BY r.id, p.module, p.action
LIMIT 50;

-- =============================================================================
-- STEP 7: ENABLE RLS (Row Level Security)
-- =============================================================================

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read permissions (needed for UI)
CREATE POLICY permissions_read_all
ON permissions FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

-- Policy: Only service role can modify
CREATE POLICY permissions_service_role_all
ON permissions FOR ALL
TO service_role
USING (true);

-- Policy: Allow authenticated to read their role permissions
CREATE POLICY role_permissions_read_own
ON role_permissions FOR SELECT
TO authenticated
USING (
    role_id IN (
        SELECT role_id FROM users WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Only service role can modify
CREATE POLICY role_permissions_service_role_all
ON role_permissions FOR ALL
TO service_role
USING (true);

-- =============================================================================
-- ROLLBACK (if needed)
-- =============================================================================

/*
-- To rollback this migration:
DROP FUNCTION IF EXISTS user_has_permission(UUID, VARCHAR);
DROP FUNCTION IF EXISTS get_user_permissions(UUID);
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
*/
