# CISSP Mastery 🎓

A modern, confidence-based flashcard learning platform for CISSP certification exam preparation. Built with Next.js 15, TypeScript, Clerk authentication, Stripe payments, and Vercel Postgres.

## ✨ Features

### For Users
- **Confidence-Based Learning**: Rate your knowledge on a 1-5 scale with Brainscape-style flashcards
- **Adaptive Spaced Repetition**: Smart algorithm schedules reviews based on your confidence levels
- **8 CISSP Domains**: Complete coverage of all Security and Privacy domains
- **Progress Tracking**: Visual mastery levels (New → Learning → Mastered)
- **Analytics Dashboard**: Study streaks, confidence trends, and performance insights
- **Mobile Responsive**: Seamless experience on all devices

### For Admins
- **Content Management**: Admin-only flashcard creation system
- **Domain Organization**: Structure content across Domains → Topics → Decks → Cards
- **Draft System**: Publish cards when ready with `isPublished` flag

### Subscription Tiers
- **Free**: 50 sample cards, 10 cards/day limit
- **Pro Monthly**: $19.99/month - unlimited access to 1000+ cards
- **Pro Yearly**: $149/year (save 37%) - unlimited access
- **Lifetime**: $299 one-time - lifetime access with all future updates

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **Authentication**: Clerk (LinkedIn OAuth only)
- **Payments**: Stripe Checkout & Customer Portal
- **Database**: Vercel Postgres / Neon / Xata.io
- **ORM**: Drizzle ORM
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Clerk account ([clerk.com](https://clerk.com))
- Stripe account ([stripe.com](https://stripe.com))
- PostgreSQL database (Vercel Postgres, Neon, or Xata.io)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cisspmastery
npm install
```

### 2. Setup Clerk Authentication

1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. **Configure OAuth Providers**:
   - Go to **User & Authentication > Social Connections**
   - Enable **LinkedIn** only
   - Disable all other providers (Google, GitHub, email/password, etc.)
   - Configure LinkedIn OAuth credentials
4. Get your API keys from **API Keys** section
5. **Setup Webhook**:
   - Go to **Webhooks** in Clerk Dashboard
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret

### 3. Setup Stripe Payments

1. Create account at [stripe.com](https://stripe.com)
2. **Create Products**:
   ```
   Product 1: CISSP Mastery Pro (Monthly)
   - Price: $19.99/month
   - Recurring: Yes

   Product 2: CISSP Mastery Pro (Yearly)
   - Price: $149/year
   - Recurring: Yes

   Product 3: CISSP Mastery Lifetime
   - Price: $299
   - One-time payment
   ```
3. Get your API keys from **Developers > API keys**
4. Get Price IDs from each product
5. **Setup Webhook**:
   - Go to **Developers > Webhooks**
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: All subscription and payment events
   - Copy the webhook secret

### 4. Setup Database

#### Option A: Vercel Postgres (Recommended for Vercel deployment)
1. Deploy to Vercel first (see deployment section)
2. Go to your project in Vercel Dashboard
3. Navigate to **Storage** tab
4. Click **Create** → **Postgres**
5. Vercel automatically sets `POSTGRES_URL` environment variables

#### Option B: Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

#### Option C: Xata.io
1. Create account at [xata.io](https://xata.io)
2. Create new database
3. Enable PostgreSQL wire protocol
4. Copy connection string

### 5. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual keys:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***
CLERK_WEBHOOK_SECRET=whsec_***

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_***
STRIPE_SECRET_KEY=sk_test_***
STRIPE_WEBHOOK_SECRET=whsec_***
STRIPE_PRO_MONTHLY_PRICE_ID=price_***
STRIPE_PRO_YEARLY_PRICE_ID=price_***
STRIPE_LIFETIME_PRICE_ID=price_***

# Database (automatically set by Vercel or from your provider)
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Database Setup

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Seed CISSP content (admin task)
npm run db:seed
```

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cisspmastery/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth routes (sign-in, sign-up)
│   │   ├── (dashboard)/         # Protected routes
│   │   │   ├── dashboard/       # Overview
│   │   │   ├── domains/         # 8 CISSP domains
│   │   │   ├── progress/        # Analytics
│   │   │   └── billing/         # Subscription management
│   │   ├── api/
│   │   │   ├── webhooks/        # Clerk & Stripe webhooks
│   │   │   └── stripe/          # Stripe API routes
│   │   ├── pricing/             # Public pricing page
│   │   └── layout.tsx           # Root layout with Clerk
│   ├── components/
│   │   ├── ui/                  # Shadcn components
│   │   ├── flashcards/          # Flashcard components
│   │   ├── billing/             # Payment components
│   │   └── layout/              # Layout components
│   ├── lib/
│   │   ├── db/                  # Database schema & queries
│   │   ├── stripe/              # Stripe utilities
│   │   ├── algorithms/          # Spaced repetition logic
│   │   └── access-control/      # Paywall logic
│   ├── hooks/                   # React hooks
│   └── types/                   # TypeScript types
├── scripts/
│   └── seed-cissp-content.ts   # Database seeding
└── drizzle/                    # Database migrations
```

## 🎨 Database Schema

### User Management
- `users` - User accounts (synced from Clerk)
- `subscriptions` - Subscription status
- `payments` - Payment history

### Content Structure (Admin-created)
- `domains` - 8 CISSP domains
- `topics` - Topics within domains
- `decks` - Card collections
- `flashcards` - Individual flashcards

### User Progress (User-consumed)
- `user_card_progress` - Card-level progress
- `study_sessions` - Study session tracking
- `session_cards` - Individual card reviews
- `deck_progress` - Deck-level stats
- `user_stats` - Overall user stats

## 🔐 Access Control

### Free Tier Limits
- 50 sample flashcards (non-premium decks)
- 10 cards per day maximum
- Basic progress tracking

### Pro Tier Access
- All 1000+ flashcards
- Unlimited daily study
- Advanced analytics
- Study streak tracking

## 📊 Admin Functions

### Creating Flashcards

1. Set user role to `admin` in database:
```sql
UPDATE users SET role = 'admin' WHERE clerk_user_id = 'user_xxx';
```

2. Use admin interface to create:
   - Domains (8 CISSP domains)
   - Topics within domains
   - Decks within topics
   - Flashcards within decks

3. Set `isPremium = true` for Pro-only content

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel Dashboard
4. Add Vercel Postgres from Storage tab
5. Deploy

### Post-Deployment

1. **Update Webhook URLs**:
   - Clerk: Update webhook endpoint to `https://your-domain.com/api/webhooks/clerk`
   - Stripe: Update webhook endpoint to `https://your-domain.com/api/webhooks/stripe`

2. **Update Environment Variables**:
   ```
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

3. **Run Database Migration** (if not auto-deployed):
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Test Webhooks**:
   - Clerk: Create test user via LinkedIn OAuth
   - Stripe: Test payment with test card (4242 4242 4242 4242)

## 🛠️ Development Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
npm run db:seed          # Seed CISSP content
```

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook secret | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Monthly plan price ID | Yes |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Yearly plan price ID | Yes |
| `STRIPE_LIFETIME_PRICE_ID` | Lifetime plan price ID | Yes |
| `POSTGRES_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL | Yes |

## 🤝 Contributing

This is an admin-managed content platform. Only administrators can create flashcards.

## 📄 License

MIT

## 🙋 Support

For issues, please create a GitHub issue or contact support.

---

Built with ❤️ for CISSP exam preparation
