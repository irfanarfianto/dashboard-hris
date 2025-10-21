# 📚 HRIS Bharata - Documentation Index

Dokumentasi lengkap untuk HRIS Bharata Dashboard.

## 📑 Table of Contents

### 👨‍💻 Developer Guide (NEW!)

**[📖 Developer Guide](./DEV_GUIDE.md)** - Panduan lengkap untuk developer

- Arsitektur sistem & tech stack
- Setup development environment
- Konvensi kode & best practices
- Navigasi ke semua panduan development

#### How-To Guides

- **[Create CRUD Feature](./how-to/CREATE_CRUD_FEATURE.md)** - Membuat fitur CRUD baru dari awal
- **[Add Search & Pagination](./how-to/ADD_SEARCH_PAGINATION.md)** - Implementasi search dan pagination

#### Migration Guides

- **[Migrate from Supabase](./migration/MIGRATE_FROM_SUPABASE.md)** - Panduan lengkap migrasi backend

---

### 🎯 Core Features

1. **[Employee Management](./EMPLOYEE_FEATURE_GUIDE.md)**

   - CRUD operations untuk data karyawan
   - Soft delete & restore functionality
   - Employee listing dengan filter & search

2. **[Employee Detail & Edit](./EMPLOYEE_DETAIL_EDIT_FEATURE.md)**

   - Halaman detail karyawan
   - Multi-step edit form
   - Pre-filled form data

3. **[Employee Education](./EMPLOYEE_EDUCATION_FEATURE.md)**

   - Manage riwayat pendidikan karyawan
   - CRUD operations untuk education history

4. **[Employee Stepper Form](./EMPLOYEE_STEPPER_IMPLEMENTATION.md)**

   - Multi-step form implementation
   - Step-by-step validation
   - Verification step before submit

5. **[Employee Verification Step](./EMPLOYEE_VERIFICATION_STEP.md)**

   - Review semua data sebelum submit
   - Step 5: Data verification

6. **[Role Management](./ROLE_FEATURE_GUIDE.md)**

   - User role & permission management
   - Role-based access control (RBAC)

7. **[Shift Schedule](./SHIFT_SCHEDULE_IMPLEMENTATION.md)**

   - Work shift management
   - Schedule assignment untuk karyawan

8. **[Location Actions](./LOCATION_ACTIONS_GUIDE.md)**

   - Server actions untuk manajemen lokasi & WiFi
   - Geofencing untuk attendance system
   - GPS & mac_address validation

9. **[Location & WiFi Management](./LOCATION_FEATURE_IMPLEMENTATION.md)**

   - Complete location management UI
   - WiFi network registration
   - CRUD operations dengan validation
   - Expandable table dengan WiFi list

10. **[Location-Company Integration](./LOCATION_COMPANY_INTEGRATION.md)**

    - Multi-tenant location management
    - Company_id relationship implementation
    - Schema migration guide
    - Auto-company selection

11. **[Location Schema Design - No Address](./LOCATION_NO_ADDRESS_FIELD.md)**

    - Why locations table doesn't need address field
    - Data normalization and consistency
    - Access address via companies join

12. **[Leaflet Map Integration](./LEAFLET_MAP_INTEGRATION.md)**

    - Interactive map untuk location selection
    - Drag & drop marker placement
    - Geofencing circle visualization
    - Current location detection

13. **[Geolocation Troubleshooting](./GEOLOCATION_TROUBLESHOOTING.md)**

    - Fix "User denied Geolocation" errors
    - HTTPS requirements
    - Browser permission settings guide
    - System location services setup
    - Error code reference

14. **[Shift Management](./SHIFT_MANAGEMENT_GUIDE.md)**

    - Work shift management
    - Shift creation & assignment
    - Position-based shifts

15. **[Shift Bulk Create Feature](./SHIFT_BULK_CREATE_FEATURE.md)**

    - Create shift untuk multiple positions sekaligus
    - Multi-select position checkbox
    - Bulk operations untuk efficiency

16. **[Shift Search Feature](./SHIFT_SEARCH_FEATURE.md)**

    - Search shift by name, position, department
    - Real-time filtering
    - Grouped display by position

17. **[Position Search & Pagination](./POSITION_SEARCH_PAGINATION.md)**

    - Multi-field search (5 fields)
    - 10 items per page pagination
    - Sequential numbering
    - Responsive controls

18. **[Employee Search & Pagination](./EMPLOYEE_SEARCH_PAGINATION.md)**
    - Multi-field search (4 fields: name, email, dept, position)
    - Gender-based stats dengan filtering
    - Auto-refresh after CRUD
    - Consistent pattern dengan positions

---

### 🎨 UI/UX Components

19. **[Responsive Sidebar Mobile](./RESPONSIVE_SIDEBAR_MOBILE.md)**

- Mobile-friendly sidebar
- Hamburger menu
- Backdrop overlay & animations
- Auto-show/hide based on screen size

20. **[Sidebar Navigation](./SIDEBAR_RESTRUCTURE.md)**

- Sidebar restructure dengan grouping
- Menu organization & hierarchy
- Placeholder pages untuk fitur yang akan datang

21. **[Skeleton Loading](./SKELETON_LOADING_GUIDE.md)**

    - Loading states dengan react-loading-skeleton
    - Dark mode support
    - TableSkeleton, DetailSkeleton, DashboardSkeleton

22. **[Toast Implementation](./TOAST_IMPLEMENTATION.md)**

    - Toast notifications dengan Sonner
    - Success, error, dan loading states

23. **[Delete Confirmation Dialog](./EMPLOYEE_FEATURE_GUIDE.md#delete-confirmation)**
    - Reusable DeleteConfirmDialog component
    - Consistent delete UX

---

### 🛠️ Technical Implementation

13. **[Currency Input](./CURRENCY_INPUT_IMPLEMENTATION.md)**

- Format Rupiah dengan separator
- Real-time formatting
- Utility functions

14. **[Currency Utils Guide](./CURRENCY_UTILS_GUIDE.md)**

- Panduan lengkap currency utilities
- formatRupiah, parseRupiah functions

15. **[Currency Quick Reference](./CURRENCY_QUICK_REFERENCE.md)**

    - Quick reference untuk currency functions

16. **[Currency Input Demo](./CURRENCY_INPUT_DEMO.md)**

    - Demo dan contoh penggunaan

17. **[Date Time Picker](./DATE_TIME_PICKER_IMPLEMENTATION.md)**

    - Date picker dengan auto-close
    - Controlled state implementation

18. **[Loading Component Guide](./LOADING_COMPONENT_GUIDE.md)**
    - Loading states & components
    - Skeleton loading patterns

---

### 🐛 Fixes & Refactoring

19. **[Authentication Fix](./AUTH_FIX_SERVICE_ROLE.md)**

    - Service Role Key untuk admin operations
    - Fix "User not allowed" error

20. **[Password Hash Fix](./PASSWORD_HASH_FIX.md)**

    - Bcrypt password hashing
    - Fix password_hash NOT NULL constraint

21. **[Date Picker Fix](./DATE_PICKER_FIX.md)**

    - Fix calendar auto-close issue
    - Controlled Popover state

22. **[Dropdown Upgrade Guide](./DROPDOWN_UPGRADE_GUIDE.md)**

    - Upgrade dari custom dropdown ke Shadcn Select
    - Migration guide

23. **[Status Removal Refactoring](./REFACTORING_STATUS_REMOVAL.md)**

    - Remove employee status column
    - Soft delete implementation

24. **[Add Employee Dialog Refactoring](./REFACTORING_ADD_EMPLOYEE_DIALOG.md)**

    - Refactoring add employee dialog
    - Code improvement

25. **[Hire Date Update](./UPDATE_HIRE_DATE_MOVED.md)**
    - Move hire date field
    - Form structure update

---

### 📊 Database & Schema

23. **[Run Database Migration](./RUN_MIGRATION.md)** ⚠️ **IMPORTANT**

    - Fix PGRST204 error (column 'mac_address' not found)
    - Step-by-step migration guide
    - Troubleshooting & verification
    - Post-migration checklist

24. **[HRIS Schema Documentation](./hris_schema_documentation.md)**

    - Complete database schema
    - Table relationships
    - Column definitions

25. **[HRIS Feature Flows](./hris_full_feature_flows.md)**

    - Complete feature flow documentation
    - User journeys
    - Business logic

26. **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)**
    - Overall implementation summary
    - Feature checklist
    - Technical stack

---

## 🔍 Quick Links

### By Category

#### 👤 Employee Features

- [Employee Feature Guide](./EMPLOYEE_FEATURE_GUIDE.md)
- [Employee Detail & Edit](./EMPLOYEE_DETAIL_EDIT_FEATURE.md)
- [Employee Education](./EMPLOYEE_EDUCATION_FEATURE.md)
- [Employee Stepper](./EMPLOYEE_STEPPER_IMPLEMENTATION.md)
- [Employee Verification](./EMPLOYEE_VERIFICATION_STEP.md)

#### 💼 Master Data & System

- [Role Management](./ROLE_FEATURE_GUIDE.md)
- [Shift Schedule](./SHIFT_SCHEDULE_IMPLEMENTATION.md)
- [Location Actions](./LOCATION_ACTIONS_GUIDE.md)
- [Location & WiFi Management](./LOCATION_FEATURE_IMPLEMENTATION.md)
- [Location-Company Integration](./LOCATION_COMPANY_INTEGRATION.md)
- [Location Schema Design](./LOCATION_NO_ADDRESS_FIELD.md)
- [Leaflet Map Integration](./LEAFLET_MAP_INTEGRATION.md)
- [Geolocation Troubleshooting](./GEOLOCATION_TROUBLESHOOTING.md)
- [Location Actions](./LOCATION_ACTIONS_GUIDE.md)

#### 💰 Currency Features

- [Currency Implementation](./CURRENCY_INPUT_IMPLEMENTATION.md)
- [Currency Utils](./CURRENCY_UTILS_GUIDE.md)
- [Currency Quick Ref](./CURRENCY_QUICK_REFERENCE.md)
- [Currency Demo](./CURRENCY_INPUT_DEMO.md)

#### 🎨 UI Components

- [Sidebar Navigation](./SIDEBAR_RESTRUCTURE.md)
- [Date Time Picker](./DATE_TIME_PICKER_IMPLEMENTATION.md)
- [Toast Notifications](./TOAST_IMPLEMENTATION.md)
- [Loading Skeleton](./SKELETON_LOADING_GUIDE.md)
- [Loading Component](./LOADING_COMPONENT_GUIDE.md)

#### 🔧 Fixes

- [Auth Fix](./AUTH_FIX_SERVICE_ROLE.md)
- [Password Hash Fix](./PASSWORD_HASH_FIX.md)
- [Date Picker Fix](./DATE_PICKER_FIX.md)
- [Dropdown Upgrade](./DROPDOWN_UPGRADE_GUIDE.md)

#### 🗄️ Database

- [Schema Documentation](./hris_schema_documentation.md)
- [Feature Flows](./hris_full_feature_flows.md)

---

## 📝 Documentation Standards

Setiap dokumentasi mengikuti format:

1. **Title** - Judul fitur/fix
2. **Problem** (untuk fix) - Deskripsi masalah
3. **Solution** - Implementasi/solusi
4. **Code Examples** - Contoh kode
5. **Usage** - Cara penggunaan
6. **Files Changed** - File yang dimodifikasi
7. **Testing** - Cara testing

---

## 🆕 Latest Updates

- 🚨 **Run Migration Guide** - Petunjuk menjalankan database migration (fix PGRST204 error)
- ✅ **Geolocation Troubleshooting** - Fix permission issues dengan comprehensive guide
- ✅ **Leaflet Map Integration** - Interactive map untuk pilih koordinat lokasi dengan visual
- ✅ **Location-Company Integration** - Multi-tenant location management dengan company_id
- ✅ **Schema Migration** - Database migration untuk column alignment
- ✅ **Location & WiFi Feature** - Complete UI implementation untuk geofencing
- ✅ **Sidebar Restructure** - Logical grouping dengan submenu
- ✅ **Placeholder Pages** - No more 404 errors untuk fitur dalam pengembangan
- ✅ **Location Actions** - Server actions untuk geofencing
- ✅ **Skeleton Loading** - Implemented react-loading-skeleton
- ✅ **Delete Dialog** - Using DeleteConfirmDialog component
- ✅ **Employee Detail** - Complete detail & edit pages
- ✅ **Toast Notifications** - Global toast implementation
- ✅ **Currency Input** - Format Rupiah dengan utilities

---

## 📧 Need Help?

Jika ada pertanyaan atau butuh klarifikasi:

1. Cek dokumentasi terkait di list di atas
2. Lihat code examples di setiap dokumentasi
3. Contact HRIS Development Team

---

**Last Updated:** October 20, 2025
