# HRIS Schema (RAW SQL in Markdown)

> Catatan: Semua _table name_, _column name_, dan _type name_ dipertahankan **100% sama** seperti pada skrip SQL.

```sql
-- ==============================================================================
-- 1. DEFINISI CUSTOM TYPES (ENUMS) - UNCHANGED
-- ==============================================================================

CREATE TYPE hris_gender AS ENUM ('L', 'P');
CREATE TYPE employee_status_enum AS ENUM ('Active', 'Inactive', 'Resigned');
CREATE TYPE attendance_status_enum AS ENUM ('Hadir', 'Terlambat', 'Izin', 'Cuti', 'Dinas');
CREATE TYPE approval_status_enum AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE approval_action_enum AS ENUM ('Approved', 'Rejected');
CREATE TYPE request_type_enum AS ENUM ('Leave', 'BusinessTrip');
CREATE TYPE contract_type_enum AS ENUM ('Probation', 'Contract', 'Permanent');
CREATE TYPE payroll_period_status_enum AS ENUM ('Open', 'Processed', 'Closed');
CREATE TYPE salary_calc_status_enum AS ENUM ('Draft', 'Final');
CREATE TYPE component_type_enum AS ENUM ('allowance', 'deduction');
CREATE TYPE calculation_method_enum AS ENUM ('fixed', 'percentage');
CREATE TYPE tax_type_enum AS ENUM ('PPh21', 'PPh26');
CREATE TYPE notification_channel_enum AS ENUM ('Email', 'Push', 'SMS');
CREATE TYPE marital_status_enum AS ENUM ('TK/0', 'K/0', 'K/1', 'K/2', 'K/3');

-- ==============================================================================
-- 2. MASTER DATA (A, G) - MODIFIED TABLES
-- ==============================================================================

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE position_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    rank_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    department_id INT NOT NULL REFERENCES departments(id),
    level_id INT NOT NULL REFERENCES position_levels(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);


-- START: MODIFIED work_shifts TABLE (Katalog Blok Waktu Operasional)
CREATE TABLE work_shifts (
    id SERIAL PRIMARY KEY,
    -- KOLOM BARU: Shift terikat ke Posisi (Position)
    position_id INT NOT NULL REFERENCES positions(id),

    name VARCHAR(50) NOT NULL,           -- Nama Shift (e.g., Pagi, Siang, Malam)
    start_time TIME NOT NULL,            -- Waktu Mulai (Acuan Check-in)
    end_time TIME NOT NULL,              -- Waktu Selesai (Acuan Check-out/Lembur)

    -- KOLOM BARU: Durasi dan Toleransi untuk Validasi
    duration_hours DECIMAL(5,2) NOT NULL,
    is_regular BOOLEAN NOT NULL,
    tolerance_minutes INT NOT NULL,      -- Toleransi keterlambatan (diatur per shift)

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- Soft Delete

    -- Constraint: Memastikan nama shift unik per posisi
    CONSTRAINT unique_shift_name_per_position UNIQUE (position_id, name)
);
-- END: MODIFIED work_shifts TABLE

-- START: DELETED TABLE (employee_shift_schedules)
-- Tabel ini dihapus karena jadwal harian rotasi ditentukan secara dinamis saat check-in.
-- END: DELETED TABLE

-- START: MODIFIED employees TABLE (shift_id dihapus)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    department_id INT NOT NULL REFERENCES departments(id),
    position_id INT NOT NULL REFERENCES positions(id),
    -- shift_id INT NOT NULL REFERENCES work_shifts(id), <-- DIHAPUS, karena shift berotasi
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    gender hris_gender NOT NULL,
    birth_date DATE NOT NULL,
    hire_date DATE NOT NULL,
    status employee_status_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);
-- END: MODIFIED employees TABLE

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    -- auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Dihapus jika auth.users tidak ada di skema
    employee_id INT UNIQUE REFERENCES employees(id), -- NULLABLE, 1:1 or 1:0
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- ⚠️ Bisa dihapus jika full pakai Supabase
    role_id INT NOT NULL REFERENCES roles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);
-- ==============================================================================
-- 3. DATA TAMBAHAN PEGAWAI (B) - UNCHANGED
-- ==============================================================================

CREATE TABLE employee_educations (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    degree VARCHAR(100) NOT NULL,
    institution VARCHAR(150) NOT NULL,
    major VARCHAR(150) NOT NULL,
    graduation_year INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE employee_documents (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    issued_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

-- Tabel 1:1 (employee_id sebagai PK & FK)
CREATE TABLE employee_personnel_details (
    employee_id INT PRIMARY KEY REFERENCES employees(id),
    religion VARCHAR(50) NOT NULL,
    marital_status marital_status_enum NOT NULL,
    ptkp_status VARCHAR(10) NOT NULL, -- Contoh: TK/0, K/1
    ktp_address TEXT NOT NULL,
    domicile_address TEXT NOT NULL,
    npwp_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

-- ==============================================================================
-- 4. PRESENSI & KEHADIRAN (C) - MODIFIED ATTENDANCES
-- ==============================================================================

CREATE TABLE attendance_rules (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    -- tolerance_minutes di sini mungkin redundan karena ada di work_shifts, tapi dipertahankan dari skema asli
    tolerance_minutes INT NOT NULL,
    working_days VARCHAR(50) NOT NULL, -- Contoh: Mon–Fri
    cut_off_date INT NOT NULL, -- Contoh: 25 (tanggal cut off payroll)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    radius_meter INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE location_wifi (
    id SERIAL PRIMARY KEY,
    location_id INT NOT NULL REFERENCES locations(id),
    ssid_name VARCHAR(100) NOT NULL,
    mac_address VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

-- START: MODIFIED attendances TABLE (shift_id diubah menjadi NULLABLE)
CREATE TABLE attendances (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    shift_id INT REFERENCES work_shifts(id), -- MODIFIKASI: NOT NULL DIHAPUS. Diisi dinamis setelah check-in.
    check_in TIMESTAMPTZ NOT NULL,
    check_out TIMESTAMPTZ,
    status attendance_status_enum NOT NULL,
    location_id INT NOT NULL REFERENCES locations(id),
    wifi_id INT REFERENCES location_wifi(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);
-- END: MODIFIED attendances TABLE

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    module VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. CUTI, IZIN, DINAS (D) - UNCHANGED
-- ==============================================================================

CREATE TABLE leave_policies (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    max_days INT NOT NULL,
    carry_forward BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    policy_id INT NOT NULL REFERENCES leave_policies(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT NOT NULL,
    status approval_status_enum NOT NULL DEFAULT 'Pending',
    approver_id INT REFERENCES employees(id), -- Karyawan yang menyetujui
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE business_trip_policies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    daily_allowance DECIMAL(12,2) NOT NULL,
    max_days INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE business_trips (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    policy_id INT NOT NULL REFERENCES business_trip_policies(id),
    destination VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    status approval_status_enum NOT NULL DEFAULT 'Pending',
    approver_id INT REFERENCES employees(id), -- Karyawan yang menyetujui
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE approval_flows (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL, -- e.g., 'Leave', 'BusinessTrip'
    level_order INT NOT NULL,
    approver_position_id INT NOT NULL REFERENCES positions(id),
    next_level_id INT,
    is_final BOOLEAN NOT NULL,
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE approval_histories (
    id SERIAL PRIMARY KEY,
    request_type request_type_enum NOT NULL,
    request_id INT NOT NULL, -- ID dari leave_requests.id atau business_trips.id
    approver_id INT NOT NULL REFERENCES employees(id),
    action approval_action_enum NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. KONTRAK, PAYROLL & TUNJANGAN (E) - UNCHANGED
-- ==============================================================================

CREATE TABLE employee_contracts (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    start_date DATE NOT NULL,
    end_date DATE,
    contract_type contract_type_enum NOT NULL,
    salary_base DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE payroll_periods (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    month INT NOT NULL,
    year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status payroll_period_status_enum NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE salaries (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    payroll_period_id INT NOT NULL REFERENCES payroll_periods(id),
    gross_salary DECIMAL(12,2) NOT NULL,
    total_deductions DECIMAL(12,2) NOT NULL,
    net_salary DECIMAL(12,2) NOT NULL,
    status salary_calc_status_enum NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE pay_components (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type component_type_enum NOT NULL,
    calculation_type calculation_method_enum NOT NULL,
    default_value DECIMAL(12,2) DEFAULT 0.00,
    is_taxable BOOLEAN NOT NULL DEFAULT TRUE,
    is_bpjs BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE employee_pay_components (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    component_id INT NOT NULL REFERENCES pay_components(id),
    value DECIMAL(12,2) NOT NULL,
    effective_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE bpjs_settings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    employee_percentage DECIMAL(5,2) NOT NULL,
    employer_percentage DECIMAL(5,2) NOT NULL,
    max_salary_base DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN NOT NULL,
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE tax_settings (
    id SERIAL PRIMARY KEY,
    type tax_type_enum NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL,
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE salary_details (
    id SERIAL PRIMARY KEY,
    salary_id INT NOT NULL REFERENCES salaries(id),
    component_id INT NOT NULL REFERENCES pay_components(id),
    amount DECIMAL(12,2) NOT NULL,
    type component_type_enum NOT NULL, -- Redundansi tipe untuk kemudahan laporan
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft Delete
);

-- ==============================================================================
-- 7. NOTIFIKASI & PERANGKAT (F) - UNCHANGED
-- ==============================================================================

CREATE TABLE notification_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message_body TEXT NOT NULL,
    type notification_channel_enum NOT NULL,
    active BOOLEAN NOT NULL,
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE user_devices (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    device_id VARCHAR(100) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL,
    deleted_at TIMESTAMPTZ -- Soft Delete
);

CREATE TABLE user_pins (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    pin_code CHAR(6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expired_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ -- Soft Delete
);

```
