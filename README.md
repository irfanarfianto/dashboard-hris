# HRIS Bharata Dashboard

Human Resource Information System - Bharata Group

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **State Management:** React Hooks
- **Form Handling:** React Hook Form
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Loading:** React Loading Skeleton

## 📁 Project Structure

```
hris-bharata-dashboard/
├── app/                      # Next.js App Router
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Main dashboard pages
│   │   ├── employees/       # Employee management
│   │   ├── companies/       # Company master data
│   │   ├── departments/     # Department master data
│   │   ├── positions/       # Position master data
│   │   ├── position-levels/ # Position level master data
│   │   ├── roles/           # Role master data
│   │   └── work-shifts/     # Work shift master data
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # Shadcn/ui components
│   ├── employees/           # Employee components
│   ├── master-data/         # Master data components
│   ├── layout/              # Layout components
│   ├── providers/           # Context providers
│   └── schedules/           # Schedule components
├── lib/                     # Utilities and libraries
│   ├── actions/             # Server actions
│   ├── supabase/            # Supabase client
│   └── utils/               # Utility functions
├── docs/                    # Documentation
│   └── *.md                 # Feature guides
└── migrations/              # Database migrations

```

## 📚 Documentation

All feature documentation is available in the [`docs/`](./docs/) folder.

📖 **[View Complete Documentation Index →](./docs/INDEX.md)**

### Quick Links

#### Core Features

- [Employee Management](./docs/EMPLOYEE_FEATURE_GUIDE.md)
- [Employee Detail & Edit](./docs/EMPLOYEE_DETAIL_EDIT_FEATURE.md)
- [Employee Education](./docs/EMPLOYEE_EDUCATION_FEATURE.md)
- [Role Management](./docs/ROLE_FEATURE_GUIDE.md)
- [Shift Schedule](./docs/SHIFT_SCHEDULE_IMPLEMENTATION.md)

#### Technical Implementation

- [Currency Input](./docs/CURRENCY_INPUT_IMPLEMENTATION.md)
- [Date Picker](./docs/DATE_TIME_PICKER_IMPLEMENTATION.md)
- [Toast Notifications](./docs/TOAST_IMPLEMENTATION.md)
- [Loading Skeleton](./docs/SKELETON_LOADING_GUIDE.md)

#### Database & Schema

- [Schema Documentation](./docs/hris_schema_documentation.md)
- [Feature Flows](./docs/hris_full_feature_flows.md)

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 🔑 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚀 Getting Started

1. Install dependencies
2. Set up Supabase project
3. Run migrations in `migrations/` folder
4. Configure environment variables
5. Run `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

## 📦 Key Features

✅ Employee Management (CRUD with soft delete)
✅ Multi-step employee form with validation
✅ Employee education history
✅ Master data management (Companies, Departments, Positions, etc)
✅ User authentication & authorization
✅ Role-based access control
✅ Work shift scheduling
✅ Dark mode support
✅ Toast notifications
✅ Skeleton loading states
✅ Responsive design
✅ TypeScript type safety

## 🎨 UI Components

Built with [Shadcn/ui](https://ui.shadcn.com/):

- Button, Input, Select, Checkbox
- Dialog, Alert Dialog, Toast
- Calendar, Date Picker
- Table, Card, Badge
- Skeleton Loading
- And more...

## 📝 License

Private - Bharata Group

## 👥 Team

HRIS Development Team - Bharata Group
