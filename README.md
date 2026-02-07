# Traction

Personal, task-based project management application designed for mobile-first use on iOS via Safari PWA.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Supabase Auth (Magic Link)
- **Drag & Drop**: dnd-kit
- **Date Handling**: date-fns + date-fns-tz

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Setup

1. **Clone and install dependencies**

   ```bash
   cd traction
   npm install
   ```

2. **Configure environment variables**

   Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`

3. **Set up the database**

   Generate Prisma client and push schema to database:

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Go to Settings > Database to get the connection strings
4. Enable Email auth in Authentication > Providers
5. Create storage buckets:
   - `attachments` - for task file attachments
   - `project-images` - for project cover images

### PWA Icons

Before deploying, generate PWA icons:

1. Create a 512x512 app icon
2. Use [RealFaviconGenerator](https://realfavicongenerator.net/) to generate all sizes
3. Place icons in `public/icons/`
4. Generate iOS splash screens using [AppScope](https://appsco.pe/developer/splash-screens)
5. Place splash screens in `public/splash/`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
traction/
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers
│   ├── (views)/           # Page groups
│   ├── auth/              # Auth callback
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout with PWA config
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── task/             # Task-related components
│   └── navigation/       # Navigation components
├── lib/                   # Utilities and configuration
│   ├── supabase/         # Supabase client setup
│   ├── db.ts             # Prisma client
│   ├── types.ts          # TypeScript types
│   ├── date.ts           # Date utilities (CST timezone)
│   └── utils.ts          # General utilities
├── prisma/               # Database schema
├── public/               # Static assets
│   ├── icons/           # PWA icons
│   ├── splash/          # iOS splash screens
│   └── manifest.json    # PWA manifest
└── __tests__/           # Test files
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Project Settings
4. Deploy

The app will automatically deploy on every push to `main`.

## License

Private - All rights reserved.
