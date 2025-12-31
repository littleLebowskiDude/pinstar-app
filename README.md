# Pinboard App

A Pinterest-like application built with Next.js 14, TypeScript, Tailwind CSS, tRPC, and Supabase.

## Features

- 🔐 **Passwordless Authentication** - Magic link email authentication via Supabase
- 📌 **Pin Management** - Save and organize images
- 📋 **Boards** - Create collections of pins
- 🔍 **Full-text Search** - Find pins by title and description
- 🎨 **Masonry Layout** - Beautiful Pinterest-style grid
- 🌙 **Dark Mode** - Automatic theme switching
- 🔒 **Row Level Security** - Secure data access with Supabase RLS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **API**: tRPC
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Links)
- **Image Storage**: Cloudinary
- **Email**: Resend
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Cloudinary account (for image uploads)
- Resend account (for emails)

### Installation

1. **Clone and install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# Cloudinary (Image Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Configure Supabase:**

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions on:
- Enabling email authentication
- Configuring redirect URLs
- Setting up SMTP
- Running database migrations

4. **Run the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
pinboard-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, callback)
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   └── auth/             # Auth-related components
│   ├── lib/                   # Utilities and configurations
│   │   └── supabase/         # Supabase client setup
│   └── server/                # tRPC routers (to be added)
├── supabase/
│   └── migrations/           # Database migrations
│       └── 001_initial_schema.sql
├── .env.local                # Environment variables (not in git)
├── .env.example             # Template for environment variables
└── middleware.ts            # Next.js middleware for auth
```

## Database Schema

### Tables

- **profiles** - User profiles (extends Supabase auth.users)
- **boards** - Collections of pins
- **pins** - Individual images with metadata
- **board_pins** - Junction table for many-to-many relationship

### Features

- Full-text search on pins
- Row Level Security (RLS) policies
- Automatic profile creation on signup
- Updated_at triggers
- Indexes for performance

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## Authentication Flow

1. User enters email on `/login`
2. Supabase sends magic link email
3. User clicks link → redirects to `/auth/callback`
4. Session created and user redirected to home
5. Protected routes (`/boards`, `/pins`) require authentication

## Development

### Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Adding New Features

1. **Database changes**: Create a new migration in `supabase/migrations/`
2. **API routes**: Add tRPC routers in `src/server/routers/`
3. **Pages**: Create new routes in `src/app/`
4. **Components**: Add reusable components in `src/components/`

## Deployment

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

**Quick Steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables (see checklist below)
4. Update Supabase redirect URLs with your Vercel domain
5. Deploy!

### Environment Variables Checklist for Vercel

**Exposed to browser** (with `NEXT_PUBLIC_` prefix):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

**Server-only** (without `NEXT_PUBLIC_` prefix):
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`

### Database Migration

Apply migrations to production:

```bash
npx supabase link --project-ref your_project_ref
npx supabase db push
```

## Troubleshooting

### Email Authentication Not Working

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed troubleshooting steps.

Common issues:
- Email provider not enabled in Supabase
- SMTP not configured
- Redirect URLs not added
- Rate limits on development email service

### Build Errors

If you encounter Tailwind CSS errors:
- Ensure `@tailwindcss/postcss` is installed
- Check `postcss.config.mjs` uses the correct plugin

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT

## Support

For issues and questions:
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Review Supabase Auth logs
- Check browser console for errors

---

Built with ❤️ using Next.js and Supabase
