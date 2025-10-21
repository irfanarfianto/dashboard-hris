# 🔄 Panduan Migrasi dari Supabase

Panduan lengkap untuk migrasi dari Supabase ke backend alternatif lain.

## Daftar Isi
- [Overview](#overview)
- [Why Migrate?](#why-migrate)
- [Migration Checklist](#migration-checklist)
- [Backend Alternatives](#backend-alternatives)
- [Step-by-Step Migration](#step-by-step-migration)
  - [1. Migrate Database](#1-migrate-database)
  - [2. Migrate Authentication](#2-migrate-authentication)
  - [3. Migrate File Storage](#3-migrate-file-storage)
  - [4. Refactor Server Actions](#4-refactor-server-actions)
  - [5. Update API Calls](#5-update-api-calls)
- [Testing Strategy](#testing-strategy)
- [Rollback Plan](#rollback-plan)

---

## Overview

Arsitektur saat ini menggunakan **Supabase** sebagai Backend-as-a-Service (BaaS) yang menyediakan:
- ✅ PostgreSQL Database
- ✅ Authentication (Email/Password, OAuth)
- ✅ Row Level Security (RLS)
- ✅ File Storage
- ✅ Real-time Subscriptions
- ✅ Auto-generated APIs

### Current Architecture

```
┌─────────────────────────────────────────────┐
│          Next.js Frontend                   │
│     (App Router + React Components)         │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│        Server Actions Layer                 │
│     (lib/actions/employeeActions.ts)        │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│         Supabase Client                     │
│   (lib/supabase/client.ts & server.ts)      │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          Supabase BaaS                      │
│  PostgreSQL + Auth + Storage + RLS          │
└─────────────────────────────────────────────┘
```

---

## Why Migrate?

### Alasan Umum Migrasi:

#### 1. **Cost Optimization**
- Supabase pricing mungkin terlalu mahal untuk scale tertentu
- Self-hosted solution lebih ekonomis untuk traffic tinggi
- Kontrol lebih baik atas infrastructure costs

#### 2. **Data Sovereignty**
- Regulatory requirements (data harus di Indonesia)
- Compliance dengan undang-undang lokal
- Full control atas data location

#### 3. **Custom Requirements**
- Butuh database features yang tidak disupport Supabase
- Custom authentication logic yang kompleks
- Integration dengan existing enterprise systems

#### 4. **Performance**
- Latency tinggi ke Supabase servers
- Butuh dedicated database server
- Custom caching strategies

#### 5. **Vendor Lock-in**
- Mengurangi ketergantungan pada satu provider
- Multi-cloud strategy
- Flexibility untuk switch provider

---

## Migration Checklist

### Pre-Migration
- [ ] Audit semua dependencies pada Supabase
- [ ] Document current database schema
- [ ] Export semua data (backup)
- [ ] List semua Supabase features yang digunakan
- [ ] Identify Supabase-specific code
- [ ] Choose alternative backend
- [ ] Setup development environment untuk backend baru
- [ ] Plan downtime window

### During Migration
- [ ] Setup new database server
- [ ] Migrate schema
- [ ] Migrate data
- [ ] Setup authentication system
- [ ] Setup file storage
- [ ] Refactor server actions
- [ ] Update API calls
- [ ] Update environment variables
- [ ] Test all features

### Post-Migration
- [ ] Performance testing
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Monitor error logs
- [ ] Gradual rollout
- [ ] Maintain backup access ke Supabase (rollback plan)
- [ ] Update documentation
- [ ] Train team on new stack

---

## Backend Alternatives

### Option 1: **Custom Backend dengan Express.js + PostgreSQL**

**Pros:**
- ✅ Full control atas semua aspek
- ✅ Dapat di-host anywhere (self-hosted, VPS, cloud)
- ✅ No vendor lock-in
- ✅ Custom business logic tanpa batasan

**Cons:**
- ❌ Harus build authentication sendiri
- ❌ Harus manage database sendiri
- ❌ Lebih banyak maintenance overhead
- ❌ No built-in RLS (harus implement manual)

**Stack:**
```
Next.js Frontend
    ↓
Express.js API (REST/GraphQL)
    ↓
PostgreSQL Database
```

### Option 2: **Firebase**

**Pros:**
- ✅ Similar BaaS experience
- ✅ Built-in authentication
- ✅ Real-time database
- ✅ Good documentation

**Cons:**
- ❌ NoSQL database (migration effort tinggi)
- ❌ Vendor lock-in (sama seperti Supabase)
- ❌ Pricing bisa expensive untuk large datasets
- ❌ Less SQL flexibility

### Option 3: **Prisma + PostgreSQL + NextAuth**

**Pros:**
- ✅ Type-safe database queries (Prisma)
- ✅ Integrated authentication (NextAuth)
- ✅ Can be self-hosted
- ✅ Great DX (Developer Experience)
- ✅ Strong TypeScript support

**Cons:**
- ❌ Need to setup database server
- ❌ No built-in RLS
- ❌ More configuration needed

**Stack:**
```
Next.js Frontend
    ↓
Server Actions / API Routes
    ↓
Prisma ORM + NextAuth
    ↓
PostgreSQL (self-hosted or managed)
```

### Option 4: **Pocketbase**

**Pros:**
- ✅ Open-source, self-hosted
- ✅ Built-in authentication
- ✅ File storage included
- ✅ Real-time subscriptions
- ✅ SQLite database (portable)
- ✅ Admin UI included

**Cons:**
- ❌ Smaller community vs Supabase
- ❌ SQLite limitations untuk high concurrency
- ❌ Kurang mature untuk enterprise

### Option 5: **Appwrite**

**Pros:**
- ✅ Open-source BaaS (self-hosted)
- ✅ Similar features dengan Supabase
- ✅ Built-in authentication
- ✅ File storage, functions, database
- ✅ Docker-based deployment

**Cons:**
- ❌ Smaller community
- ❌ Migration effort moderate

---

## Step-by-Step Migration

## 1. Migrate Database

### 1.1 Export Schema dari Supabase

```bash
# Via Supabase CLI
supabase db dump --schema public > schema.sql

# Atau via pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres --schema-only > schema.sql
```

### 1.2 Export Data

```bash
# Export all data
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres --data-only > data.sql

# Or specific tables
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres --table=employees --table=departments > data.sql
```

### 1.3 Setup New Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt install postgresql

# Create database
createdb hris_bharata

# Import schema
psql -d hris_bharata -f schema.sql

# Import data
psql -d hris_bharata -f data.sql
```

**Option B: Managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)**
```bash
# Create instance via cloud console
# Connect to instance
psql -h your-instance.region.rds.amazonaws.com -U postgres -d hris_bharata

# Import schema & data
psql -h your-instance -U postgres -d hris_bharata -f schema.sql
psql -h your-instance -U postgres -d hris_bharata -f data.sql
```

### 1.4 Verify Migration

```sql
-- Check table count
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Check row counts
SELECT 
  table_name, 
  (xpath('/row/count/text()', 
    xml_count))[1]::text::int as row_count
FROM (
  SELECT table_name, 
    query_to_xml(format('SELECT COUNT(*) FROM %I.%I', 
      table_schema, table_name), false, true, '') as xml_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
) t
ORDER BY table_name;
```

---

## 2. Migrate Authentication

### Current: Supabase Auth

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // ...
  )
}

// Usage in actions
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Option A: NextAuth.js

**Install:**
```bash
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

**Setup:**
```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
})

// middleware.ts
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/dashboard/:path*"]
}
```

**Usage:**
```typescript
// In Server Actions
import { auth } from "@/lib/auth"

export async function getEmployees() {
  const session = await auth()
  
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  // ... rest of code
}

// In Server Components
import { auth } from "@/lib/auth"

export default async function Page() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return <div>Welcome {session.user.email}</div>
}
```

### Option B: Custom JWT Authentication

```typescript
// lib/auth/jwt.ts
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET!

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

// lib/auth/middleware.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./jwt"

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const user = verifyToken(token)

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}
```

---

## 3. Migrate File Storage

### Current: Supabase Storage

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar1.png', file)

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('public/avatar1.png')
```

### Option A: AWS S3

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
// lib/storage/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadFile(key: string, file: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await s3Client.send(command)

  return {
    success: true,
    url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  }
}

export async function getFileUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn })

  return url
}
```

### Option B: Local Storage

```typescript
// lib/storage/local.ts
import fs from "fs/promises"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads")

export async function uploadFile(filename: string, file: Buffer) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  
  const filepath = path.join(UPLOAD_DIR, filename)
  await fs.writeFile(filepath, file)

  return {
    success: true,
    url: `/uploads/${filename}`,
  }
}

export async function deleteFile(filename: string) {
  const filepath = path.join(UPLOAD_DIR, filename)
  await fs.unlink(filepath)
  
  return { success: true }
}
```

---

## 4. Refactor Server Actions

### Pattern: Abstraction Layer

Create database client abstraction untuk memudahkan switch antara Supabase dan alternatif.

**Before (Direct Supabase):**
```typescript
// lib/actions/employeeActions.ts
import { createClient } from "@/lib/supabase/server"

export async function getEmployees() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .is("deleted_at", null)

  if (error) return { success: false, error: error.message }
  
  return { success: true, data }
}
```

**After (Abstraction Layer):**

```typescript
// lib/db/client.ts
import { prisma } from "./prisma"  // or any ORM

export const db = {
  employees: {
    async findMany(options?: any) {
      return prisma.employee.findMany({
        where: { deleted_at: null, ...options?.where },
        include: options?.include,
        orderBy: options?.orderBy,
      })
    },
    
    async findUnique(id: number) {
      return prisma.employee.findUnique({
        where: { id, deleted_at: null },
      })
    },
    
    async create(data: any) {
      return prisma.employee.create({ data })
    },
    
    async update(id: number, data: any) {
      return prisma.employee.update({
        where: { id },
        data: { ...data, updated_at: new Date() },
      })
    },
    
    async softDelete(id: number) {
      return prisma.employee.update({
        where: { id },
        data: { deleted_at: new Date() },
      })
    },
  },
  // ... other tables
}

// lib/actions/employeeActions.ts
import { db } from "@/lib/db/client"

export async function getEmployees() {
  try {
    const employees = await db.employees.findMany({
      include: {
        departments: true,
        positions: true,
      },
      orderBy: { full_name: "asc" },
    })

    return { success: true, data: employees }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, error: "Failed to fetch employees" }
  }
}
```

**Benefits:**
- ✅ Easy to switch between ORMs
- ✅ Centralized query logic
- ✅ Consistent API across actions
- ✅ Easier testing (mock db object)

---

## 5. Update API Calls

### Frontend tidak perlu berubah!

Karena kita menggunakan **Server Actions pattern**, frontend code **tidak perlu diubah sama sekali**.

```typescript
// components/EmployeeTable.tsx
import { getEmployees } from "@/lib/actions/employeeActions"

// ✅ Code ini tetap sama, tidak peduli backend apa yang digunakan
const result = await getEmployees()
```

**Keuntungan Pattern ini:**
- ✅ Frontend decoupled dari backend implementation
- ✅ Backend changes tidak affect frontend
- ✅ Easy to test & maintain
- ✅ Type-safe end-to-end

---

## Testing Strategy

### 1. Unit Testing
```typescript
// __tests__/actions/employeeActions.test.ts
import { getEmployees, createEmployee } from "@/lib/actions/employeeActions"
import { db } from "@/lib/db/client"

jest.mock("@/lib/db/client")

describe("Employee Actions", () => {
  it("should fetch employees", async () => {
    (db.employees.findMany as jest.Mock).mockResolvedValue([
      { id: 1, full_name: "John Doe" }
    ])

    const result = await getEmployees()

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })
})
```

### 2. Integration Testing
Test dengan actual database connection (dev/staging).

### 3. End-to-End Testing
Use Playwright atau Cypress untuk test full user flows.

### 4. Load Testing
Use k6 atau Apache JMeter untuk stress test.

---

## Rollback Plan

### 1. Keep Supabase Temporarily
Jangan langsung delete Supabase project setelah migrasi. Keep selama 30-90 hari.

### 2. Feature Flags
Use feature flags untuk gradual rollout:

```typescript
// lib/config.ts
export const USE_NEW_BACKEND = process.env.NEXT_PUBLIC_USE_NEW_BACKEND === "true"

// lib/actions/employeeActions.ts
export async function getEmployees() {
  if (USE_NEW_BACKEND) {
    return getEmployeesFromNewBackend()
  } else {
    return getEmployeesFromSupabase()
  }
}
```

### 3. Database Replication
Setup real-time replication Supabase ↔ New DB selama transition period.

### 4. Monitoring
Setup comprehensive monitoring:
- Error rates
- Response times
- Database connections
- API success rates

---

## Cost Comparison

### Supabase (Pro Plan)
- Base: $25/month
- Database: ~$0.125/GB
- Bandwidth: ~$0.09/GB
- Storage: ~$0.021/GB

**Estimated for 100 employees:**
- ~$50-100/month

### Self-Hosted (VPS)
- VPS (4GB RAM): $20-40/month
- PostgreSQL: Free
- Nginx: Free
- SSL: Free (Let's Encrypt)

**Estimated:**
- ~$20-40/month + maintenance time

### AWS/GCP (Managed)
- RDS/Cloud SQL: $50-100/month
- EC2/Compute Engine: $30-50/month
- S3/Cloud Storage: $5-10/month

**Estimated:**
- ~$85-160/month

---

## Conclusion

Migration memerlukan planning dan effort yang signifikan. Pastikan:
1. ✅ Ada alasan kuat untuk migrate (cost, compliance, dll)
2. ✅ Team ready untuk maintenance overhead
3. ✅ Budget untuk migration effort
4. ✅ Testing strategy comprehensive
5. ✅ Rollback plan jelas

Jika Supabase sudah memenuhi kebutuhan dan budget tidak jadi masalah, **tidak perlu migrate**.

---

## Related Documentation

- [BACKEND_ALTERNATIVES.md](./BACKEND_ALTERNATIVES.md) - Detailed backend comparison
- [CREATE_SERVER_ACTION.md](../how-to/CREATE_SERVER_ACTION.md) - Server Actions pattern
- [DEV_GUIDE.md](../DEV_GUIDE.md) - Development guide

---

**Last Updated**: 2025-01-21
