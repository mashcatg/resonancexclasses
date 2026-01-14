# ResonanceX Classes - Learning Management System

This is a comprehensive online learning platform built with modern web technologies.
## Features

- **Course Management**: Create, manage, and distribute courses
- **Student Dashboard**: Track progress, enrollments, and certificates
- **Admin Panel**: Manage users, courses, enrollments, and platform settings
- **Quiz System**: Create and manage quizzes with various question types
- **Device Management**: Approve and manage student devices
- **Coupon System**: Create discount codes for courses
- **Hero Section Customization**: Customize landing page settings
- **Testimonials Management**: Display student testimonials
- **PWA Support**: Works offline with service workers
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Real-time Updates**: Supabase integration for live data

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Forms**: React Hook Form
- **State Management**: TanStack Query
- **Deployment**: Vercel

## Project Structure

```
resonancex-classes/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components and layouts
│   │   ├── admin/          # Admin dashboard pages
│   │   └── student/        # Student dashboard pages
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   ├── lib/                # Utility functions and helpers
│   └── App.tsx             # Main App component
├── public/                 # Static files
│   ├── sitemap.xml        # SEO sitemap
│   ├── robots.txt         # SEO robots directives
│   └── manifest.json      # PWA manifest
├── supabase/              # Database migrations
└── package.json           # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 16+ or Bun
- npm, yarn, or bun package manager
- Supabase account

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. Open [http://localhost:8080](http://localhost:8080) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for all available configuration options:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_APP_NAME` - Application name
- `VITE_APP_URL` - Application URL

## Database

Database migrations are located in `supabase/migrations/`. Run migrations:

```bash
supabase migration up
```

## Routes

### Public Routes
- `/` - Landing page
- `/courses` - Browse all courses
- `/login` - User login
- `/privacy-policy` - Privacy policy
- `/terms-of-service` - Terms of service

### Student Routes (Protected)
- `/student/dashboard` - Student dashboard
- `/student/my-courses` - Enrolled courses
- `/student/profile` - Student profile
- `/student/course/:id` - Course details

### Admin Routes (Protected)
- `/admin/dashboard` - Admin dashboard
- `/admin/courses` - Manage courses
- `/admin/students` - Manage students
- `/admin/enrollments` - Enrollment requests
- `/admin/device-approvals` - Device approvals
- `/admin/coupons` - Coupon management
- `/admin/hero-settings` - Landing page settings
- `/admin/testimonials` - Testimonials management
- `/admin/profile` - Admin profile

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## Support
For support, contact: support@zenith-learns.com

## License

All rights reserved. ResonanceX Classes © 2026

## Status

- **Version**: 1.0.0
- **Last Updated**: January 14, 2026
- **Deployment**: Vercel
- **Status**: Production Ready

---

Built with ❤️ by ENNOVAT STUDIO
