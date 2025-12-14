# Easy Habit Pro - Product Requirements Document (PRD)

## 1. Executive Summary

**Easy Habit Pro** is a modern, minimalist habit tracking web application that helps users build and maintain positive habits through visual tracking, progress analytics, and behavioral psychology principles. The app offers a freemium model with a clean, distraction-free interface optimized for both desktop and mobile use.

---

## 2. Technical Architecture

### 2.1 Tech Stack

| Layer         | Technology                                                      |
| ------------- | --------------------------------------------------------------- |
| Frontend      | React 18+ with Vite, React Router, Zustand (state management)   |
| Styling       | Tailwind CSS                                                    |
| Charts        | Recharts or Chart.js                                            |
| Backend       | Supabase (PostgreSQL, Auth, Edge Functions, Realtime)           |
| Payments      | Stripe Checkout + Customer Portal                               |
| Email         | Supabase (built-in email for auth + triggers for transactional) |
| Local Storage | IndexedDB via Dexie.js for offline-first sync                   |
| Hosting       | Netlify (frontend), Supabase (backend)                          |

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React SPA (Vite)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Zustand   │  │  React Query │  │   Dexie.js        │  │
│  │   (State)   │  │  (API Cache) │  │   (Offline DB)    │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │    Auth     │  │  PostgreSQL  │  │  Edge Functions   │  │
│  │  (Google,   │  │   (RLS)      │  │  (Stripe hooks,   │  │
│  │   Email)    │  │              │  │   email triggers) │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────┐         ┌──────────────────────┐
│       Stripe         │         │   Supabase Email     │
│  (Subscriptions)     │         │   (Transactional)    │
└──────────────────────┘         └──────────────────────┘
```

---

## 3. Database Schema

### 3.1 Tables

```sql
-- Users profile extension (Supabase auth handles core user data)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'free', -- 'free', 'standard_monthly', 'standard_yearly', 'cancelled'
  subscription_end_date TIMESTAMPTZ,
  dark_mode_preference TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
  weekly_summary_enabled BOOLEAN DEFAULT true,
  monthly_summary_enabled BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags for habit categorization
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1', -- Tailwind indigo-500
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  target_days_per_month INTEGER DEFAULT 20, -- Goal: X days per month
  sort_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit-Tag relationship (many-to-many)
CREATE TABLE habit_tags (
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (habit_id, tag_id)
);

-- Daily habit entries
CREATE TABLE habit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL, -- 'done', 'planned', null (for deletion we just remove row)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Achievements/Gamification
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL, -- 'first_habit', 'week_streak', 'month_complete', etc.
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB, -- Store extra info like streak count, habit name, etc.
  UNIQUE(user_id, achievement_type)
);

-- Sync tracking for offline-first
CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tags: Users can only manage their own tags
CREATE POLICY "Users can manage own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

-- Habits: Users can only manage their own habits
CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- Habit Tags: Users can manage tags for their habits
CREATE POLICY "Users can manage habit tags" ON habit_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_tags.habit_id AND habits.user_id = auth.uid())
  );

-- Habit Entries: Users can manage their own entries
CREATE POLICY "Users can manage own entries" ON habit_entries
  FOR ALL USING (auth.uid() = user_id);

-- Achievements: Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sync Log: Users can access their own sync log
CREATE POLICY "Users can manage own sync log" ON sync_log
  FOR ALL USING (auth.uid() = user_id);
```

### 3.3 Database Functions & Triggers

```sql
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_entries_updated_at
  BEFORE UPDATE ON habit_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 4. Feature Specifications

### 4.1 Authentication

| Feature                | Description                                   |
| ---------------------- | --------------------------------------------- |
| Email/Password Sign Up | Standard registration with email verification |
| Google OAuth           | One-click Google sign-in                      |
| Password Reset         | Email-based password reset flow               |
| Sign Out               | Clear session and local data option           |
| Session Persistence    | Remember me functionality                     |

### 4.2 Habit Tracking (Core Feature)

#### Desktop View (Full Month)

- **Grid Layout**: Habits as rows, days 1-31 as columns
- **Header Row**: Day numbers with weekday indicators (Mon, Tue, etc.)
- **Today Highlight**: Current day column highlighted
- **Sum Column**: Right-most column shows completion count + target
- **Progress Bar**: Visual indicator of target vs actual
- **Status Indicators**:
  - Empty: No status
  - ✓ (checkmark/filled circle): Done (green)
  - P (or clock icon): Planned (blue/purple)
- **Click Behavior**:
  - Future date click → "Planned"
  - Today/Past date click → "Done"
  - Second click → Remove status
- **Sorting**: Drag-and-drop reorder habits

#### Mobile View

**Weekly View (Default)**:

- 7-day horizontal scroll/swipe
- Larger touch targets
- Same click behavior as desktop
- Week navigation arrows

**Daily View**:

- Single day focus
- List of all habits with large checkboxes
- Date picker for navigation
- Quick "Mark All Done" option

**Toggle**: Easy switch between week and day view

### 4.3 Habit Management

| Feature           | Free Tier | Standard Tier |
| ----------------- | --------- | ------------- |
| Max Active Habits | 5         | Unlimited     |
| Tags              | 3         | Unlimited     |
| Archive Habits    | ✓         | ✓             |
| Target Days/Month | ✓         | ✓             |
| Color Coding      | ✓         | ✓             |
| Export Data       | -         | ✓ (CSV)       |

### 4.4 Statistics Dashboard

- **Monthly Completion Rate**: Donut/ring chart showing % complete
- **Trend Chart**: Line graph showing completion rate over past 6-12 months
- **Per-Habit Performance**: Bar chart comparing habits
- **Streak Tracker**: Current streak and longest streak per habit
- **Heat Map**: GitHub-style yearly contribution view
- **Best Day Analysis**: Which weekday has highest completion

### 4.5 Gamification (Basic)

| Achievement      | Trigger                       |
| ---------------- | ----------------------------- |
| 🌱 First Step    | Create first habit            |
| 📅 Week Warrior  | 7-day streak on any habit     |
| 🔥 On Fire       | 30-day streak on any habit    |
| 💯 Perfectionist | 100% completion in a month    |
| 🎯 Goal Getter   | Hit target days for habit     |
| ⭐ Multi-tasker  | Complete 5+ habits in one day |

### 4.6 User Settings/Account

- Profile management (name, avatar)
- Password change
- Email preferences (weekly/monthly summaries toggle)
- Dark mode toggle (light/dark/system)
- Timezone selection
- Subscription management (via Stripe Customer Portal)
- Data export
- Delete account

---

## 5. Subscription & Payments

### 5.1 Pricing Plans

| Plan             | Price               | Features                                             |
| ---------------- | ------------------- | ---------------------------------------------------- |
| Free             | $0                  | 5 habits, 3 tags, basic stats                        |
| Standard Monthly | $5/month            | Unlimited habits & tags, advanced stats, data export |
| Standard Yearly  | $40/year ($3.33/mo) | Same as monthly + 33% savings                        |

### 5.2 Stripe Integration

- **Checkout Session**: Server-side session creation via Supabase Edge Function
- **Customer Portal**: Allow users to manage subscription, update payment, cancel
- **Webhooks**: Handle via Supabase Edge Function:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- **Proration**: Handle plan changes mid-cycle

### 5.3 Stripe Setup Instructions

1. Create Stripe account at https://stripe.com
2. Create products in Stripe Dashboard:
   - "Standard Monthly" - $5/month recurring
   - "Standard Yearly" - $40/year recurring
3. Get API keys (publishable + secret)
4. Set up webhook endpoint pointing to Supabase Edge Function
5. Configure environment variables in Supabase

---

## 6. Email Notifications

### 6.1 Transactional Emails (Supabase Built-in)

| Email Type            | Trigger            |
| --------------------- | ------------------ |
| Email Verification    | After signup       |
| Password Reset        | User request       |
| Magic Link (optional) | Passwordless login |

### 6.2 Custom Emails (via Supabase Edge Functions + Database Triggers)

| Email Type             | Trigger                                             |
| ---------------------- | --------------------------------------------------- |
| Welcome                | After profile creation (trigger on profiles insert) |
| Subscription Confirmed | After Stripe webhook processes                      |
| Subscription Cancelled | After Stripe webhook processes                      |
| Payment Failed         | After Stripe webhook processes                      |

### 6.3 Engagement Emails (User Configurable - via Scheduled Edge Functions)

| Email Type      | Frequency    | Content                                   |
| --------------- | ------------ | ----------------------------------------- |
| Weekly Summary  | Every Monday | Last week's stats, streaks, encouragement |
| Monthly Summary | 1st of month | Monthly review, achievements, trends      |

**Note**: For scheduled emails, we'll use Supabase pg_cron or an external scheduler (Netlify Scheduled Functions) to trigger the Edge Functions.

---

## 7. Page Structure

### 7.1 Public Pages

| Page             | Route             | Description                  |
| ---------------- | ----------------- | ---------------------------- |
| Landing          | `/`               | Marketing homepage           |
| Why Easy Habit   | `/why`            | Psychology & differentiation |
| Pricing          | `/pricing`        | Plan comparison              |
| Login            | `/login`          | Sign in form                 |
| Sign Up          | `/signup`         | Registration form            |
| Reset Password   | `/reset-password` | Password reset flow          |
| Privacy Policy   | `/privacy`        | Legal                        |
| Terms of Service | `/terms`          | Legal                        |
| Contact          | `/contact`        | Contact form/info            |

### 7.2 Authenticated Pages

| Page       | Route           | Description             |
| ---------- | --------------- | ----------------------- |
| Dashboard  | `/app`          | Main habit tracker view |
| Statistics | `/app/stats`    | Charts and analytics    |
| Settings   | `/app/settings` | User preferences        |
| Account    | `/app/account`  | Profile & subscription  |

---

## 8. Landing Page Content

### 8.1 Hero Section

- **Headline**: "Build Better Habits, One Day at a Time"
- **Subline**: "The simple, beautiful habit tracker that helps you stay consistent and achieve your goals"
- **CTA Buttons**: "Start Free" | "See How It Works"
- **Hero Image**: App screenshot showing monthly view

### 8.2 Features Section

- Full month view at a glance
- Works offline, syncs automatically
- Beautiful statistics & insights
- Light & dark mode
- Works on any device

### 8.3 How It Works

1. Create your habits (free: up to 5)
2. Track daily with one click
3. Watch your progress grow
4. Build lasting routines

### 8.4 Social Proof (Fictional Reviews)

```
"Finally, a habit tracker that doesn't overwhelm me. I can see my whole month
and it keeps me motivated!"
— Sarah M., Designer ⭐⭐⭐⭐⭐

"Been using Easy Habit Pro for 6 months. Lost 20 lbs by tracking my exercise
and diet habits daily."
— Michael T., Software Engineer ⭐⭐⭐⭐⭐

"The simplest habit tracker I've found. No gimmicks, just results."
— Jennifer L., Marketing Manager ⭐⭐⭐⭐⭐

"I tried 10 different habit apps. This is the one that stuck."
— David K., Entrepreneur ⭐⭐⭐⭐⭐
```

### 8.5 Pricing Preview

- Show free vs standard comparison
- Highlight yearly savings
- "Start Free, Upgrade Anytime"

### 8.6 Footer

Links to:

- Pricing
- Contact
- Privacy Policy
- Terms of Service
- © 2024 Easy Habit Pro

---

## 9. "Why Easy Habit Pro" Page Content

### 9.1 The Psychology Behind Habits

#### The Habit Loop

Based on Charles Duhigg's research in "The Power of Habit":

- **Cue**: The trigger that initiates the behavior
- **Routine**: The behavior itself
- **Reward**: The benefit you gain from doing the behavior

Easy Habit Pro helps by making the cue visual (seeing your monthly grid), the routine simple (one click), and the reward satisfying (watching your progress grow).

#### Atomic Habits Principles

James Clear's framework for building good habits:

- **Make it Obvious**: Our full-month view keeps your habits visible
- **Make it Attractive**: Clean design and progress visualization
- **Make it Easy**: One-tap tracking, no friction
- **Make it Satisfying**: Streaks, achievements, and stats celebrate your wins

#### Don't Break the Chain

Jerry Seinfeld's productivity secret: Mark an X on a calendar for every day you do your habit. Your only job is to not break the chain. Our monthly grid is designed exactly for this psychological technique.

#### The Compound Effect

Small daily actions lead to remarkable results over time. We help you see this through our statistics that show month-over-month improvement.

### 9.2 Why We're Different

| Problem with Other Apps                                      | Easy Habit Pro Solution                                                |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **Feature Overload**: Too many options, confusing interfaces | **Focused Simplicity**: Just what you need, nothing more               |
| **Notification Fatigue**: Constant reminders become annoying | **Optional & Gentle**: You choose if/when to be reminded               |
| **Can't See Big Picture**: Daily view loses context          | **Full Month View**: See your entire month at a glance                 |
| **Complicated Setup**: Takes forever to configure            | **Start in Seconds**: Add a habit and start tracking immediately       |
| **Expensive Premium**: $10-15/month for basic features       | **Affordable**: Generous free tier, $5/month or $40/year for unlimited |
| **Data Locked In**: Can't export your own data               | **Your Data is Yours**: Export anytime (Premium)                       |
| **No Offline Mode**: Useless without internet                | **Offline-First**: Track anytime, sync when connected                  |

### 9.3 Our Philosophy

**Less is More**
We believe the best tool is one you'll actually use. That's why we've stripped away everything unnecessary and kept only what matters: tracking your habits and seeing your progress.

**Friction-Free Tracking**
Every extra tap is a reason to skip tracking. That's why we've made it one tap to mark a habit done. No confirmations, no modals, no friction.

**Celebrate Small Wins**
Building habits is hard. We believe in celebrating every small victory with visual progress indicators, streaks, and achievements.

**Privacy-First**
Your habits are personal. We don't sell your data, we don't show ads, and we don't track more than we need to. Your data is yours.

---

## 10. UI/UX Design Specifications

### 10.1 Color Palette

**Light Mode**:

- Background: `#FFFFFF` (white)
- Surface: `#F9FAFB` (gray-50)
- Border: `#E5E7EB` (gray-200)
- Text Primary: `#111827` (gray-900)
- Text Secondary: `#6B7280` (gray-500)
- Primary/Accent: `#6366F1` (indigo-500)
- Success (Done): `#10B981` (emerald-500)
- Info (Planned): `#8B5CF6` (violet-500)

**Dark Mode**:

- Background: `#111827` (gray-900)
- Surface: `#1F2937` (gray-800)
- Border: `#374151` (gray-700)
- Text Primary: `#F9FAFB` (gray-50)
- Text Secondary: `#9CA3AF` (gray-400)
- Primary/Accent: `#818CF8` (indigo-400)
- Success (Done): `#34D399` (emerald-400)
- Info (Planned): `#A78BFA` (violet-400)

### 10.2 Typography

- **Font Family**: Inter (Google Fonts) - clean, modern, excellent readability
- **Headings**: 600-700 weight
- **Body**: 400-500 weight
- **Scale**: Tailwind default (text-sm, text-base, text-lg, etc.)

### 10.3 Logo (Placeholder Design)

- **Wordmark**: "Easy Habit" in Inter Bold
- **Icon**: Simple checkmark inside a circle, or calendar grid icon
- **Color**: Primary indigo color

### 10.4 Dark Mode Implementation

- Auto-detect system preference using `prefers-color-scheme` media query
- Manual toggle in settings (light/dark/system)
- Store preference in user profile (synced) and localStorage (for fast initial load)
- Use Tailwind's `dark:` variant classes

---

## 11. Offline-First Sync Strategy

### 11.1 Local Database (Dexie.js/IndexedDB)

```javascript
// Local schema mirrors Supabase
const db = new Dexie("EasyHabitPro");
db.version(1).stores({
  habits: "id, user_id, name, sort_order, is_archived",
  habit_entries: "id, habit_id, date, [habit_id+date]",
  tags: "id, user_id, name",
  habit_tags: "[habit_id+tag_id]",
  pendingSync: "++id, table, operation, record_id, data, created_at",
});
```

### 11.2 Sync Flow

1. **Write**: Always write to local first, add to `pendingSync` queue
2. **Background Sync**: When online, process `pendingSync` queue via Service Worker
3. **Conflict Resolution**: Last-write-wins with `updated_at` timestamp comparison
4. **Initial Load**: Fetch all user data on login, store locally
5. **Real-time Updates**: Subscribe to Supabase Realtime for live updates from other devices

### 11.3 Sync States

- 🟢 Synced: All changes saved to cloud
- 🟡 Syncing: Changes being uploaded
- 🔴 Offline: Working locally, will sync when connected

---

## 12. Development Phases

### Phase 1: Foundation (Week 1-2)

- [ ] Project setup (Vite + React + Tailwind + React Router)
- [ ] Supabase project configuration
- [ ] Database schema creation (SQL migrations)
- [ ] RLS policies implementation
- [ ] Authentication flows (email signup, Google OAuth, password reset)
- [ ] Basic routing structure and layout components
- [ ] Dark mode implementation

### Phase 2: Core Features (Week 3-4)

- [ ] Habit CRUD operations
- [ ] Monthly tracker grid view (desktop)
- [ ] Day cell click behavior (done/planned logic)
- [ ] Mobile weekly view with swipe
- [ ] Mobile daily view
- [ ] View toggle (week/day on mobile)
- [ ] Drag-and-drop habit reordering

### Phase 3: Offline & Sync (Week 5)

- [ ] Dexie.js local database setup
- [ ] Offline-first write operations
- [ ] Background sync implementation
- [ ] Supabase Realtime subscription
- [ ] Sync status indicator

### Phase 4: Statistics & Gamification (Week 6)

- [ ] Statistics dashboard layout
- [ ] Monthly completion donut chart
- [ ] Trend line chart (6-12 months)
- [ ] Per-habit bar chart
- [ ] Streak calculation and display
- [ ] Heat map visualization
- [ ] Achievement system implementation

### Phase 5: Payments & Subscription (Week 7)

- [ ] Stripe account setup and products creation
- [ ] Supabase Edge Function for Checkout Session
- [ ] Supabase Edge Function for Stripe Webhooks
- [ ] Subscription status handling in app
- [ ] Stripe Customer Portal integration
- [ ] Free tier limits enforcement

### Phase 6: Email & User Settings (Week 7-8)

- [ ] Supabase email templates customization
- [ ] Welcome email trigger
- [ ] Subscription email triggers
- [ ] User settings page (preferences, password change)
- [ ] Account page (profile, subscription management)
- [ ] Data export functionality (premium)

### Phase 7: Marketing Pages (Week 8)

- [ ] Landing page with all sections
- [ ] "Why Easy Habit Pro" page
- [ ] Pricing page
- [ ] Contact page
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Responsive design verification

### Phase 8: Polish & Launch (Week 9)

- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] SEO meta tags and Open Graph
- [ ] Error handling and edge cases
- [ ] Final bug fixes
- [ ] Netlify deployment configuration
- [ ] Domain connection

---

## 13. File Structure

```
habit-tracker4/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   ├── og-image.png
│   └── _redirects          # Netlify SPA redirects
├── src/
│   ├── components/
│   │   ├── common/         # Button, Input, Modal, Card, Toggle, etc.
│   │   ├── layout/         # Header, Footer, Sidebar, AppShell
│   │   ├── auth/           # LoginForm, SignupForm, ResetPasswordForm
│   │   ├── habits/         # HabitGrid, HabitRow, DayCell, HabitForm
│   │   ├── stats/          # DonutChart, LineChart, BarChart, HeatMap, StreakCard
│   │   ├── settings/       # SettingsForm, AccountForm, SubscriptionCard
│   │   └── landing/        # Hero, Features, HowItWorks, Testimonials, PricingPreview
│   ├── pages/
│   │   ├── public/         # Landing, Why, Pricing, Login, Signup, ResetPassword, Privacy, Terms, Contact
│   │   └── app/            # Dashboard, Stats, Settings, Account
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useHabits.js
│   │   ├── useSync.js
│   │   ├── useTheme.js
│   │   └── useSubscription.js
│   ├── lib/
│   │   ├── supabase.js     # Supabase client initialization
│   │   ├── db.js           # Dexie.js local database
│   │   └── stripe.js       # Stripe helpers
│   ├── store/
│   │   ├── authStore.js
│   │   ├── habitStore.js
│   │   └── uiStore.js
│   ├── utils/
│   │   ├── dates.js        # Date manipulation helpers
│   │   ├── streaks.js      # Streak calculation
│   │   └── achievements.js # Achievement logic
│   ├── styles/
│   │   └── globals.css     # Tailwind imports + custom styles
│   ├── App.jsx
│   ├── main.jsx
│   └── router.jsx          # React Router configuration
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── functions/
│       ├── create-checkout-session/
│       │   └── index.ts
│       ├── stripe-webhook/
│       │   └── index.ts
│       └── send-summary-email/
│           └── index.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── netlify.toml
└── README.md
```

---

## 14. Environment Variables

```bash
# .env.example

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (public key for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# App
VITE_APP_URL=http://localhost:5173

# For Supabase Edge Functions (set in Supabase Dashboard)
# STRIPE_SECRET_KEY=sk_test_xxx
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 15. Supabase Setup Instructions

### 15.1 Create Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project name: "easy-habit-pro"
4. Generate a strong database password (save it!)
5. Select region closest to target users
6. Wait for project to provision

### 15.2 Run Database Migrations

1. Go to SQL Editor in Supabase Dashboard
2. Run the SQL from Section 3.1 (Tables)
3. Run the SQL from Section 3.2 (RLS Policies)
4. Run the SQL from Section 3.3 (Functions & Triggers)

### 15.3 Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider (already enabled by default)
3. Enable Google provider:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase
4. Go to Authentication → URL Configuration
   - Set Site URL: `https://your-domain.com`
   - Add Redirect URLs for local development: `http://localhost:5173`

### 15.4 Configure Email Templates

1. Go to Authentication → Email Templates
2. Customize templates for:
   - Confirm signup
   - Reset password
   - Magic link (optional)

### 15.5 Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy send-summary-email
```

### 15.6 Set Edge Function Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 16. Stripe Setup Instructions

### 16.1 Create Stripe Account

1. Go to https://stripe.com
2. Sign up for an account
3. Complete business verification (can use test mode initially)

### 16.2 Create Products

1. Go to Products in Stripe Dashboard
2. Create "Standard Monthly":
   - Name: "Easy Habit Pro - Monthly"
   - Price: $5.00 USD, recurring monthly
   - Save the Price ID (price_xxx)
3. Create "Standard Yearly":
   - Name: "Easy Habit Pro - Yearly"
   - Price: $40.00 USD, recurring yearly
   - Save the Price ID (price_xxx)

### 16.3 Set Up Webhook

1. Go to Developers → Webhooks
2. Add endpoint:
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
3. Copy Webhook signing secret (whsec_xxx)

### 16.4 Configure Customer Portal

1. Go to Settings → Billing → Customer portal
2. Enable portal features:
   - Update payment method
   - View invoice history
   - Cancel subscription
3. Save settings

---

## 17. Netlify Deployment Configuration

### 17.1 netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 17.2 Deployment Steps

1. Push code to GitHub repository
2. Go to https://netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select repository
5. Configure build settings (should auto-detect from netlify.toml)
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_APP_URL`
7. Deploy!

### 17.3 Custom Domain

1. Go to Domain settings in Netlify
2. Add custom domain
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Netlify)

---

## 18. Analytics (Future)

_To be implemented after initial launch_

Options to consider:

- **Plausible Analytics**: Privacy-focused, GDPR compliant
- **Simple Analytics**: Similar to Plausible
- **Supabase**: Custom event tracking with database

---

## 19. Success Metrics

### 19.1 User Metrics

- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- User retention (Day 1, Day 7, Day 30)
- Habits created per user
- Daily check-in rate

### 19.2 Business Metrics

- Free to paid conversion rate
- Monthly Recurring Revenue (MRR)
- Churn rate
- Customer Lifetime Value (LTV)

### 19.3 Engagement Metrics

- Average monthly completion rate
- Streak length distribution
- Feature usage (stats page visits, exports, etc.)

---

## 20. Document History

| Version | Date       | Author | Changes     |
| ------- | ---------- | ------ | ----------- |
| 1.0     | 2024-11-24 | Claude | Initial PRD |

---

## 21. Appendix

### 21.1 Competitor Analysis

| App                | Pros                         | Cons                              |
| ------------------ | ---------------------------- | --------------------------------- |
| Habitify           | Beautiful UI, cross-platform | Expensive ($6.99/mo), complex     |
| Streaks            | Simple, Apple ecosystem      | iOS only, limited features        |
| Loop Habit Tracker | Free, open source            | Android only, dated UI            |
| Habitica           | Gamification                 | Too complex, RPG not for everyone |
| Notion             | Flexible                     | Not purpose-built, requires setup |

### 21.2 Target User Personas

**Persona 1: The Self-Improver (Sarah, 28)**

- Marketing professional
- Wants to build exercise and reading habits
- Tried other apps but found them overwhelming
- Values simplicity and beautiful design

**Persona 2: The Productivity Enthusiast (Mike, 35)**

- Software developer
- Tracks multiple work and personal habits
- Needs offline access (commutes on subway)
- Wants data and statistics

**Persona 3: The Beginner (Emma, 22)**

- College student
- First time trying habit tracking
- Free tier is important
- Uses phone primarily
