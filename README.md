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

## Future AI Enhancements

The following AI-enabled features are planned to enhance the application:

### High Priority

1. **Smart Time Entry Prediction**
   - AI-powered autocomplete for work descriptions based on past entries
   - 40% reduction in time entry effort
   - Uses NLP and pattern matching for suggestions
   - Client-side ML model for real-time predictions

2. **Workload Optimization Engine**
   - AI-driven optimal hour allocations based on team performance
   - 25% improvement in resource utilization
   - Uses regression analysis for predictions
   - Considers historical project data and team capacity

3. **Anomaly Detection System**
   - Automatic flagging of unusual time entries or budget patterns
   - 30% faster issue detection
   - Real-time monitoring with configurable thresholds
   - Early warning system for project health

### Medium Priority

4. **Predictive Budget Forecasting**
   - AI-powered budget projections based on spending patterns
   - 20% more accurate budget forecasts
   - Time series analysis for trend prediction
   - Confidence intervals for risk assessment

5. **Smart Team Recommendations**
   - AI suggests optimal team composition
   - 15% improvement in team performance
   - Uses collaborative filtering
   - Based on skills and historical performance

6. **Natural Language Project Updates**
   - Generate human-readable status reports from time data
   - 50% reduction in reporting effort
   - Template-based text generation
   - Automated insight extraction

### Low Priority

7. **Contextual Learning System**
   - System learns from user corrections and feedback
   - 10% monthly improvement in suggestion accuracy
   - Reinforcement learning approach
   - Continuous model improvement

8. **Voice-Enabled Time Entry**
   - Natural language processing for voice logging
   - 20% increase in mobile usage
   - Speech-to-text integration
   - Hands-free time tracking

### Implementation Considerations

- **Privacy & Security**
  - All AI features respect data privacy
  - Model training on anonymized data
  - Clear user consent system

- **Scalability**
  - Incremental learning design
  - Efficient data processing
  - Multi-tenant architecture

- **Integration**
  - Seamless Supabase integration
  - Real-time update system
  - Optimized performance

- **Technical Architecture**
  - Edge ML for client features
  - Efficient batch processing
  - Smart caching strategy

- **User Experience**
  - Progressive feature disclosure
  - Clear AI explanations
  - Manual override options
