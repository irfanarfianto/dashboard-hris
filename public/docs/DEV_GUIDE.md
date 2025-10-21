# 📚 Panduan Developer HRIS Bharata

## Daftar Isi

### 🎯 Panduan Umum
- [Arsitektur Sistem](#arsitektur-sistem)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Konvensi Kode](#konvensi-kode)

### 🔧 Setup & Konfigurasi
- [Setup Development](#setup-development)
- [Konfigurasi Supabase](#konfigurasi-supabase)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)

### 📖 Panduan Fitur
- [Authentication System](./features/AUTH_SYSTEM.md)
- [Employee Management](./features/EMPLOYEE_MANAGEMENT.md)
- [Position Management](./features/POSITION_MANAGEMENT.md)
- [Shift Management](./features/SHIFT_MANAGEMENT.md)
- [Location Management](./features/LOCATION_MANAGEMENT.md)

### 🏗️ Panduan Pembuatan Fitur Baru
- [Create CRUD Feature](./how-to/CREATE_CRUD_FEATURE.md)
- [Add Search & Pagination](./how-to/ADD_SEARCH_PAGINATION.md)
- [Create Server Action](./how-to/CREATE_SERVER_ACTION.md)
- [Add Form Validation](./how-to/ADD_FORM_VALIDATION.md)

### 🔄 Panduan Migrasi
- [Migration Guide Overview](./migration/MIGRATION_OVERVIEW.md)
- [Migrate from Supabase](./migration/MIGRATE_FROM_SUPABASE.md)
- [Backend Alternatives](./migration/BACKEND_ALTERNATIVES.md)

### 🎨 UI/UX Guidelines
- [Component Library](./ui/COMPONENT_LIBRARY.md)
- [Responsive Design](./ui/RESPONSIVE_DESIGN.md)
- [Theme & Styling](./ui/THEME_STYLING.md)

### 🧪 Testing & Debugging
- [Testing Guide](./testing/TESTING_GUIDE.md)
- [Common Issues](./testing/COMMON_ISSUES.md)
- [Performance Tips](./testing/PERFORMANCE_TIPS.md)

---

## Arsitektur Sistem

### Overview
HRIS Bharata menggunakan **Next.js 14** dengan **App Router** dan **Supabase** sebagai Backend-as-a-Service (BaaS).

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend Layer                         │
│  Next.js 14 (App Router) + React + TypeScript + Tailwind   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    API/Actions Layer                         │
│         Server Actions (lib/actions/*.ts)                    │
│    - employeeActions.ts                                      │
│    - shiftActions.ts                                         │
│    - locationActions.ts                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Supabase Client Layer                      │
│         (lib/supabase/client.ts & server.ts)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     Supabase BaaS                            │
│  - PostgreSQL Database                                       │
│  - Authentication                                            │
│  - Row Level Security (RLS)                                  │
│  - Storage                                                   │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. **Frontend Layer**
- **Lokasi**: `app/`, `components/`
- **Fungsi**: 
  - Rendering UI
  - Client-side state management
  - Form handling & validation
  - User interactions
- **Teknologi**: React, TypeScript, Tailwind CSS, shadcn/ui

#### 2. **API/Actions Layer**
- **Lokasi**: `lib/actions/`
- **Fungsi**:
  - Business logic
  - Data fetching & mutations
  - Error handling
  - Type safety
- **Pattern**: Server Actions (Next.js 14)

#### 3. **Supabase Client Layer**
- **Lokasi**: `lib/supabase/`
- **Fungsi**:
  - Connection management
  - Authentication wrapper
  - Query builder interface
- **Files**: `client.ts` (client-side), `server.ts` (server-side)

#### 4. **Database Layer**
- **Lokasi**: Supabase Cloud
- **Fungsi**:
  - Data persistence
  - User authentication
  - File storage
  - Real-time subscriptions

---

## Tech Stack

### Core
- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript 5+
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Library**: React 18+

### Styling
- **CSS Framework**: Tailwind CSS 3+
- **Component Library**: shadcn/ui
- **Icons**: Lucide React

### State & Data
- **Server State**: React Server Components
- **Client State**: React Hooks (useState, useEffect)
- **Forms**: React Hook Form (optional)
- **Validation**: Zod (optional)

### Developer Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Package Manager**: npm/yarn/pnpm

---

## Struktur Proyek

```
hris-bharata-dashboard/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Protected routes
│   │   ├── employees/          # Employee management
│   │   ├── positions/          # Position management
│   │   ├── shifts/             # Shift management
│   │   ├── locations/          # Location management
│   │   └── layout.tsx          # Dashboard layout
│   ├── auth/                   # Authentication pages
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
│
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── layout/                 # Layout components
│   ├── employees/             # Employee-specific components
│   ├── master-data/           # Master data components
│   └── ...                    # Other feature components
│
├── lib/                        # Utility libraries
│   ├── actions/               # Server Actions
│   │   ├── employeeActions.ts
│   │   ├── shiftActions.ts
│   │   └── locationActions.ts
│   ├── supabase/             # Supabase clients
│   │   ├── client.ts         # Client-side
│   │   └── server.ts         # Server-side
│   └── utils/                # Utility functions
│       ├── currency.ts
│       └── date.ts
│
├── migrations/                 # Database migrations
│   └── *.sql                  # SQL migration files
│
├── docs/                       # Documentation
│   ├── DEV_GUIDE.md           # This file
│   ├── features/              # Feature docs
│   ├── how-to/                # How-to guides
│   └── migration/             # Migration guides
│
├── public/                     # Static assets
├── .env.local                 # Environment variables (gitignored)
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

---

## Konvensi Kode

### File Naming
- **Components**: PascalCase (`EmployeeTable.tsx`)
- **Pages**: kebab-case (`employees/page.tsx`)
- **Actions**: camelCase (`employeeActions.ts`)
- **Utilities**: camelCase (`currency.ts`)
- **Types**: PascalCase (`Employee.ts`)

### Component Structure
```typescript
"use client"; // If needed

import { ... } from "...";

interface ComponentProps {
  // Props definition
}

export default function Component({ ...props }: ComponentProps) {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Server Action Structure
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";

export async function actionName(params: ParamsType) {
  const supabase = await createClient();
  
  try {
    // Validation
    if (!params.required) {
      return { success: false, error: "Validation message" };
    }
    
    // Database operation
    const { data, error } = await supabase
      .from("table")
      .operation();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Internal error" };
  }
}
```

### Type Safety
- **Always define interfaces** for component props
- **Type database responses** using Supabase generated types
- **Use TypeScript strict mode**
- **Avoid `any` type** unless absolutely necessary

### Code Style
- **Indentation**: 2 spaces
- **Quotes**: Double quotes for JSX, single for TS
- **Semicolons**: Optional but consistent
- **Line length**: Max 80-100 characters
- **Comments**: Use for complex logic only

---

## Setup Development

### Prerequisites
```bash
# Required
- Node.js 18+ 
- npm/yarn/pnpm
- Git
- Supabase account

# Recommended
- VS Code
- VS Code Extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
```

### Installation Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd hris-bharata-dashboard
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Setup Environment Variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Run Database Migrations**
```bash
# See: docs/RUN_MIGRATION.md
```

5. **Start Development Server**
```bash
npm run dev
```

6. **Access Application**
```
http://localhost:3000
```

---

## Konfigurasi Supabase

### Setup Project

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and API keys

2. **Configure Authentication**
   - Enable Email authentication
   - Configure redirect URLs
   - Set up email templates

3. **Setup Database**
   - Run migrations from `migrations/` folder
   - Configure Row Level Security (RLS)
   - Create database functions if needed

4. **Configure Storage (Optional)**
   - Create storage buckets
   - Set up policies
   - Configure file upload limits

### Supabase Client Usage

**Client-side (components with "use client")**
```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data } = await supabase.from("table").select();
```

**Server-side (Server Components, Server Actions)**
```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data } = await supabase.from("table").select();
```

---

## Environment Variables

### Required Variables
```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional Variables
```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=HRIS Bharata

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### Security Notes
- ⚠️ **NEVER commit `.env.local`** to version control
- ✅ Use `.env.example` for template
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/staging/prod

---

## Database Migration

See detailed guide: [RUN_MIGRATION.md](./RUN_MIGRATION.md)

### Quick Start
```sql
-- Run migrations in order from migrations/ folder
-- Example:
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f migrations/001_initial.sql
```

---

## Navigasi Dokumentasi Lanjutan

### 📖 Untuk Memulai Pengembangan
1. Baca [CREATE_CRUD_FEATURE.md](./how-to/CREATE_CRUD_FEATURE.md) - Membuat fitur CRUD baru
2. Baca [ADD_SEARCH_PAGINATION.md](./how-to/ADD_SEARCH_PAGINATION.md) - Menambah search & pagination
3. Baca [CREATE_SERVER_ACTION.md](./how-to/CREATE_SERVER_ACTION.md) - Membuat server action

### 🔄 Untuk Migrasi Backend
1. Baca [MIGRATION_OVERVIEW.md](./migration/MIGRATION_OVERVIEW.md) - Overview migrasi
2. Baca [MIGRATE_FROM_SUPABASE.md](./migration/MIGRATE_FROM_SUPABASE.md) - Langkah migrasi dari Supabase
3. Baca [BACKEND_ALTERNATIVES.md](./migration/BACKEND_ALTERNATIVES.md) - Alternatif backend

### 🎨 Untuk UI Development
1. Baca [COMPONENT_LIBRARY.md](./ui/COMPONENT_LIBRARY.md) - Komponen yang tersedia
2. Baca [RESPONSIVE_DESIGN.md](./ui/RESPONSIVE_DESIGN.md) - Panduan responsive

---

## Kontribusi

### Git Workflow
1. Create feature branch: `git checkout -b feature/nama-fitur`
2. Make changes and commit: `git commit -m "feat: deskripsi"`
3. Push branch: `git push origin feature/nama-fitur`
4. Create Pull Request

### Commit Message Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

---

## Support & Resources

### Internal Resources
- 📚 Documentation: `docs/` folder
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

---

**Last Updated**: {{ date }}
**Version**: 1.0.0
