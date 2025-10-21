# 📚 HRIS Bharata - Documentation

Selamat datang di dokumentasi lengkap HRIS Bharata Dashboard.

## 🚀 Quick Start

### Untuk Developer Baru

1. **Baca dulu**: [Developer Guide](./DEV_GUIDE.md) - Overview lengkap sistem
2. **Setup**: Ikuti panduan setup di [DEV_GUIDE.md - Setup Development](./DEV_GUIDE.md#setup-development)
3. **Mulai coding**: Lihat [How-To Guides](#how-to-guides)

### Untuk Developer Existing

- **Lihat Index**: [INDEX.md](./INDEX.md) - Daftar lengkap semua dokumentasi
- **Cari fitur**: Gunakan search di INDEX.md atau GitHub

---

## 📖 Dokumentasi Utama

### 👨‍💻 Developer Guide

**[📘 DEV_GUIDE.md](./DEV_GUIDE.md)** - Panduan utama untuk developer

Berisi:

- 🏗️ Arsitektur sistem & tech stack
- ⚙️ Setup development environment
- 📝 Konvensi kode & best practices
- 🗂️ Struktur proyek
- 🔧 Konfigurasi Supabase
- 🎯 Navigasi ke semua panduan development

### 📋 Complete Index

**[📑 INDEX.md](./INDEX.md)** - Index lengkap semua dokumentasi

Berisi link ke:

- Core features (Employee, Shift, Location, dll)
- UI/UX implementations
- Technical guides
- Migration guides

---

## 🛠️ How-To Guides

### Membuat Fitur Baru

**[Create CRUD Feature](./how-to/CREATE_CRUD_FEATURE.md)**

Panduan step-by-step untuk membuat fitur CRUD lengkap:

- ✅ Database schema & migration
- ✅ Server actions (Create, Read, Update, Delete)
- ✅ Page component dengan state management
- ✅ Table component
- ✅ Form dialog (Create/Edit)
- ✅ Delete dialog

**Contoh implementasi**: Departments, Positions, Employees

### Menambahkan Search & Pagination

**[Add Search & Pagination](./how-to/ADD_SEARCH_PAGINATION.md)**

Panduan untuk menambahkan search dan pagination:

- ✅ Convert ke client component
- ✅ Multi-field search filter
- ✅ Pagination logic (10 items/page)
- ✅ Search UI dengan icon
- ✅ Pagination controls
- ✅ Update stats untuk filtered data

**Contoh implementasi**: Employees, Positions, Shifts

---

## 🔄 Migration Guides

### Migrasi dari Supabase

**[Migrate from Supabase](./migration/MIGRATE_FROM_SUPABASE.md)**

Panduan lengkap untuk migrasi backend:

- 📊 Export database schema & data
- 🔐 Setup authentication alternatif
- 💾 Migrate file storage
- 🔧 Refactor server actions
- ✅ Testing strategy
- 🔙 Rollback plan

**Backend alternatives**: Prisma + PostgreSQL, Firebase, Pocketbase, Appwrite

---

## 📚 Feature Documentation

### Core Features

- [Employee Management](./EMPLOYEE_FEATURE_GUIDE.md) - CRUD karyawan
- [Employee Detail & Edit](./EMPLOYEE_DETAIL_EDIT_FEATURE.md) - Detail & edit page
- [Employee Education](./EMPLOYEE_EDUCATION_FEATURE.md) - Riwayat pendidikan
- [Position Management](./POSITION_SEARCH_PAGINATION.md) - Posisi/jabatan
- [Shift Management](./SHIFT_MANAGEMENT_GUIDE.md) - Manajemen shift kerja
- [Location Management](./LOCATION_FEATURE_IMPLEMENTATION.md) - Lokasi & geofencing

### Advanced Features

- [Employee Stepper Form](./EMPLOYEE_STEPPER_IMPLEMENTATION.md) - Multi-step form
- [Shift Schedule](./SHIFT_SCHEDULE_IMPLEMENTATION.md) - Jadwal shift
- [Bulk Create Shifts](./SHIFT_BULK_CREATE_FEATURE.md) - Create multiple shifts
- [Role Management](./ROLE_FEATURE_GUIDE.md) - User roles & permissions

### UI/UX Implementation

- [Responsive Sidebar](./RESPONSIVE_SIDEBAR_MOBILE.md) - Mobile-friendly sidebar
- [Currency Input](./CURRENCY_INPUT_IMPLEMENTATION.md) - Format input rupiah
- [Date Time Picker](./DATE_TIME_PICKER_IMPLEMENTATION.md) - Date picker component
- [Loading Components](./LOADING_COMPONENT_GUIDE.md) - Skeleton loading states
- [Toast Notifications](./TOAST_IMPLEMENTATION.md) - Toast messages

### Technical Guides

- [Authentication Fix](./AUTH_FIX_SERVICE_ROLE.md) - Fix auth issues
- [Password Hash Fix](./PASSWORD_HASH_FIX.md) - Bcrypt implementation
- [Run Migration](./RUN_MIGRATION.md) - Database migrations
- [Geolocation Troubleshooting](./GEOLOCATION_TROUBLESHOOTING.md) - Fix GPS issues

---

## 🗂️ Folder Structure

```
docs/
├── README.md                    # This file (overview)
├── INDEX.md                     # Complete documentation index
├── DEV_GUIDE.md                 # Main developer guide
│
├── how-to/                      # Step-by-step guides
│   ├── CREATE_CRUD_FEATURE.md
│   └── ADD_SEARCH_PAGINATION.md
│
├── migration/                   # Migration guides
│   └── MIGRATE_FROM_SUPABASE.md
│
├── features/                    # Feature documentation (coming soon)
│   ├── AUTH_SYSTEM.md
│   ├── EMPLOYEE_MANAGEMENT.md
│   └── ...
│
└── [Other docs...]             # Individual feature docs
```

---

## 🎯 Common Tasks

### "Saya mau buat fitur master data baru"

👉 Baca: [CREATE_CRUD_FEATURE.md](./how-to/CREATE_CRUD_FEATURE.md)

### "Saya mau tambah search dan pagination"

👉 Baca: [ADD_SEARCH_PAGINATION.md](./how-to/ADD_SEARCH_PAGINATION.md)

### "Saya mau migrate dari Supabase"

👉 Baca: [MIGRATE_FROM_SUPABASE.md](./migration/MIGRATE_FROM_SUPABASE.md)

### "Saya mau tau arsitektur sistemnya"

👉 Baca: [DEV_GUIDE.md - Arsitektur](./DEV_GUIDE.md#arsitektur-sistem)

### "Saya mau tau cara setup development"

👉 Baca: [DEV_GUIDE.md - Setup](./DEV_GUIDE.md#setup-development)

### "Saya cari dokumentasi fitur tertentu"

👉 Lihat: [INDEX.md](./INDEX.md)

---

## 💡 Tips

### Untuk Developer Baru

1. Mulai dari [DEV_GUIDE.md](./DEV_GUIDE.md)
2. Setup environment sesuai panduan
3. Baca contoh implementasi existing features
4. Coba buat fitur sederhana dulu (misal: Departments)

### Untuk Developer Experienced

1. Gunakan [INDEX.md](./INDEX.md) sebagai referensi cepat
2. Lihat how-to guides untuk pattern yang sudah established
3. Contribute dokumentasi untuk fitur baru yang dibuat

---

## 🤝 Contributing to Docs

Jika membuat fitur baru, **selalu update dokumentasi**:

1. Buat file dokumentasi baru di `docs/`
2. Tambahkan link ke [INDEX.md](./INDEX.md)
3. Update [DEV_GUIDE.md](./DEV_GUIDE.md) jika perlu
4. Commit dokumentasi bersamaan dengan kode

**Format dokumentasi**:

```markdown
# 📌 Nama Fitur

## Overview

Brief description

## Implementation

Step-by-step

## Code Examples

Actual code

## Testing

How to test

## Related Docs

Links to related docs
```

---

## 📞 Need Help?

- 📚 Cek [INDEX.md](./INDEX.md) dulu
- 🔍 Search di docs folder
- 💬 Tanya di team chat
- 🐛 Create issue di GitHub

---

**Last Updated**: 2025-01-21  
**Version**: 2.0.0

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

```env
NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
```

> [!NOTE]
> This example uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, which refers to Supabase's new **publishable** key format.
> Both legacy **anon** keys and new **publishable** keys can be used with this variable name during the transition period. Supabase's dashboard may show `NEXT_PUBLIC_SUPABASE_ANON_KEY`; its value can be used in this example.
> See the [full announcement](https://github.com/orgs/supabase/discussions/29260) for more information.

Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
