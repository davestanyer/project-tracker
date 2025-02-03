# Project Time Tracker

A modern, full-stack time tracking application built with React, TypeScript, and Supabase. Track project hours, manage team members, and monitor budgets with ease.

![Project Time Tracker](https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=1200)

## Features

- **Project Management**
  - Create and manage multiple projects
  - Set monthly budgets
  - Track project progress and spending

- **Team Management**
  - Add team members to projects
  - Set individual hourly rates
  - Monitor team member contributions

- **Time Tracking**
  - Log work hours with descriptions
  - View daily and monthly summaries
  - Track time against project budgets

- **Budget Allocation**
  - Set monthly project budgets
  - Allocate hours per team member
  - Monitor budget utilization

- **Real-time Updates**
  - Instant updates across all users
  - Live budget tracking
  - Immediate team member changes

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - React Router
  - Zustand (State Management)
  - date-fns
  - React Hot Toast

- **Backend**
  - Supabase
  - PostgreSQL
  - Row Level Security (RLS)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create a new Supabase project
2. Run the migration files in the `supabase/migrations` directory
3. Enable Row Level Security (RLS) policies

## Usage

### Authentication

- Register a new account with email and password
- Log in with existing credentials
- Automatic session management

### Managing Projects

1. Create a new project from the dashboard
2. Set monthly budgets
3. Add team members and set their hourly rates
4. Track time and monitor progress

### Time Logging

1. Navigate to a project
2. Click "Log Time"
3. Enter date, hours, and work description
4. Submit to record time entry

### Budget Management

1. Edit project settings
2. Set monthly budgets
3. Monitor spending through the budget progress bar
4. View detailed breakdowns per team member

## Security

- Row Level Security (RLS) ensures data access control
- Secure authentication via Supabase
- Protected API endpoints
- Role-based access control

## Development

### Project Structure

```
project-tracker/
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utilities and store
│   │   ├── store/     # Zustand stores
│   │   └── supabase/  # Supabase client and types
│   ├── pages/         # Route components
│   └── main.tsx       # Entry point
├── supabase/
│   └── migrations/    # Database migrations
└── public/           # Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.