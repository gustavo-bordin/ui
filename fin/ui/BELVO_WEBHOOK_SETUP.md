# Belvo Webhook Integration - Complete Setup Guide

## 📋 Overview

This project now includes a complete Belvo webhook integration system that:

- ✅ Receives webhooks from Belvo when financial data is ready
- ✅ Fetches owners, accounts, and transactions from Belvo API
- ✅ Stores all data in Supabase with proper relationships
- ✅ Handles both historical updates (initial 1-year data) and periodic refreshes (every 6 hours)

## 🏗️ Architecture

```
┌─────────────────────┐
│  Next.js Frontend   │
│  (UI Application)   │
└──────────┬──────────┘
           │
           │ User connects bank
           ▼
┌─────────────────────┐
│   Belvo Widget      │
│ (Bank Connection)   │
└──────────┬──────────┘
           │
           │ Creates link_id
           ▼
┌─────────────────────┐      ┌──────────────────────┐
│  Success Callback   │─────▶│   Supabase DB        │
│  (saves link_id)    │      │ (user_onboarding)    │
└─────────────────────┘      └──────────────────────┘
           │
           │ Belvo scrapes data
           ▼
┌─────────────────────┐
│   Belvo Server      │
│ (Data Processing)   │
└──────────┬──────────┘
           │
           │ Sends webhooks
           ▼
┌─────────────────────┐
│ Belvo Webhook       │
│   Service (Go)      │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌──────────────┐
│ Belvo   │  │  Supabase    │
│ API     │  │  Storage     │
└─────────┘  └──────────────┘
```

## 📂 Project Structure

```
.
├── belvo-webhook-service/          # Go webhook service
│   ├── cmd/
│   │   └── server/                 # Main application
│   ├── internal/
│   │   ├── config/                 # Configuration management
│   │   ├── handlers/               # HTTP handlers
│   │   ├── models/                 # Data models
│   │   └── services/
│   │       ├── belvo/             # Belvo API client
│   │       └── storage/           # Supabase storage
│   ├── migrations/                 # Database migrations
│   ├── go.mod
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── README.md
│   ├── DEPLOYMENT.md
│   └── INTEGRATION.md
│
├── supabase/migrations/
│   └── 20250113000002_add_belvo_link_id_to_onboarding.sql
│
└── app/api/belvo/callback/
    └── success/route.ts           # Already saves link_id
```

## 🚀 Quick Start

### 1. Apply Database Migrations

```bash
# Navigate to your project root
cd /path/to/your/project

# Apply Belvo tables migration
psql -h your-db-host -U postgres -d postgres -f belvo-webhook-service/migrations/20250113000001_create_belvo_tables.sql

# Apply link_id migration
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250113000002_add_belvo_link_id_to_onboarding.sql

# Or using Supabase CLI
supabase db push
```

### 2. Run the Webhook Service

**Option A: Local Development**

```bash
cd belvo-webhook-service

# Create .env file
cat > .env << EOF
PORT=8080
BELVO_SECRET_ID=your_belvo_secret_id
BELVO_SECRET_PASSWORD=your_belvo_secret_password
BELVO_API_URL=https://sandbox.belvo.com/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
LOG_LEVEL=info
EOF

# Install dependencies and run
make deps
make run
```

**Option B: Docker**

```bash
cd belvo-webhook-service

# Create .env file (same as above)

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

**Option C: Deploy to Cloud**

See `belvo-webhook-service/DEPLOYMENT.md` for detailed deployment guides for:

- Google Cloud Run
- AWS ECS/Fargate
- Fly.io
- Railway
- Render

### 3. Configure Belvo Webhooks

1. Go to [Belvo Dashboard](https://dashboard.belvo.com)
2. Navigate to **Settings** → **Webhooks**
3. Click **Add Webhook**
4. Enter your webhook URL: `https://your-service-url.com/webhooks/belvo`
5. Subscribe to these events:
   - ✅ OWNERS (historical_update)
   - ✅ OWNERS (new_owners_available)
   - ✅ ACCOUNTS (historical_update)
   - ✅ ACCOUNTS (new_accounts_available)
   - ✅ TRANSACTIONS (historical_update)
   - ✅ TRANSACTIONS (new_transactions_available)
6. Save and test

### 4. Test the Integration

```bash
# Test health endpoint
curl http://localhost:8080/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "belvo-webhook-service"
# }

# After a user connects their bank, check the database
psql -h your-db-host -U postgres -d postgres -c "
  SELECT * FROM belvo_webhook_events
  ORDER BY created_at DESC
  LIMIT 5;
"
```

## 📊 Database Schema

### New Tables Created

#### `belvo_owners`

Stores bank account owner information

- `id` - UUID primary key
- `belvo_id` - Unique Belvo identifier
- `link_id` - Belvo link reference
- `user_id` - Foreign key to auth.users
- `email`, `phone_number`, `display_name` - Owner details
- `raw_data` - Complete JSON response from Belvo

#### `belvo_accounts`

Stores bank account information

- `id` - UUID primary key
- `belvo_id` - Unique Belvo identifier
- `link_id` - Belvo link reference
- `user_id` - Foreign key to auth.users
- `balance_current`, `balance_available` - Account balances
- `institution`, `name`, `type` - Account details
- `raw_data` - Complete JSON response from Belvo

#### `belvo_transactions`

Stores financial transactions

- `id` - UUID primary key
- `belvo_id` - Unique Belvo identifier
- `account_id` - Foreign key to belvo_accounts
- `user_id` - Foreign key to auth.users
- `amount`, `balance` - Transaction amounts
- `value_date`, `accounting_date` - Transaction dates
- `description`, `category`, `type` - Transaction details
- `raw_data` - Complete JSON response from Belvo

#### `belvo_webhook_events`

Audit log of all webhook events

- `id` - UUID primary key
- `webhook_id` - Unique webhook identifier from Belvo
- `webhook_type`, `process_type` - Event classification
- `link_id` - Associated Belvo link
- `has_errors` - Boolean flag for error tracking
- `data` - Webhook payload

### Modified Table

#### `user_onboarding`

Added column:

- `belvo_link_id` - Stores the Belvo link ID for each user

## 🔄 Data Flow

### Initial Connection (Historical Update)

1. **User Action**: User completes onboarding and connects bank account
2. **Belvo Widget**: Creates a `link_id` and redirects to success callback
3. **Success Callback** (`app/api/belvo/callback/success/route.ts`):
   - Saves `link_id` to `user_onboarding.belvo_link_id`
   - Marks onboarding as complete
4. **Belvo Processing**: Scrapes last 1 year of data (takes minutes to hours)
5. **Webhook Notifications**: Belvo sends webhooks as data becomes available:
   ```
   OWNERS → historical_update → Service fetches & stores owners
   ACCOUNTS → historical_update → Service fetches & stores accounts
   TRANSACTIONS → historical_update → Service fetches & stores transactions
   ```

### Periodic Refresh (Every 6 Hours)

1. **Belvo Auto-Refresh**: Automatically updates data every 6 hours
2. **Webhook Notifications**: Sends webhooks for new data:
   ```
   OWNERS → new_owners_available
   ACCOUNTS → new_accounts_available
   TRANSACTIONS → new_transactions_available
   ```
3. **Service Processing**: Fetches and stores updated data

## 💻 Using the Data in Your App

### Query User's Accounts

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: accounts } = await supabase
    .from('belvo_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('balance_current', { ascending: false })

  return (
    <div>
      <h1>Your Accounts</h1>
      {accounts?.map(account => (
        <div key={account.id}>
          <h3>{account.name}</h3>
          <p>Balance: {account.currency} {account.balance_current}</p>
          <p>Institution: {account.institution}</p>
        </div>
      ))}
    </div>
  )
}
```

### Query Recent Transactions

```typescript
const { data: transactions } = await supabase
  .from("belvo_transactions")
  .select(
    `
    *,
    belvo_accounts (
      name,
      institution
    )
  `
  )
  .eq("user_id", userId)
  .gte("value_date", "2024-01-01")
  .order("value_date", { ascending: false })
  .limit(50)
```

### Calculate Monthly Spending

```typescript
const { data: spending } = await supabase
  .from("belvo_transactions")
  .select("category, amount")
  .eq("user_id", userId)
  .eq("type", "OUTFLOW")
  .gte("value_date", startOfMonth)
  .lte("value_date", endOfMonth)
```

## 🔧 Configuration

### Environment Variables

**Webhook Service:**

```env
PORT=8080
BELVO_SECRET_ID=your_secret_id
BELVO_SECRET_PASSWORD=your_secret_password
BELVO_API_URL=https://sandbox.belvo.com/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
LOG_LEVEL=info
```

**Next.js App** (already configured):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BELVO_SECRET_ID=your_secret_id
BELVO_SECRET_PASSWORD=your_secret_password
NEXT_PUBLIC_APP_URL=http://localhost:4000
```

## 📝 Monitoring

### Check Webhook Events

```sql
-- Recent webhook events
SELECT
  webhook_id,
  webhook_type,
  process_type,
  link_id,
  has_errors,
  created_at
FROM belvo_webhook_events
ORDER BY created_at DESC
LIMIT 20;

-- Webhook errors
SELECT *
FROM belvo_webhook_events
WHERE has_errors = true;
```

### Check Data Freshness

```sql
-- Last update per user
SELECT
  bo.user_id,
  MAX(bo.updated_at) as last_owner_update,
  MAX(ba.updated_at) as last_account_update,
  MAX(bt.updated_at) as last_transaction_update
FROM belvo_owners bo
LEFT JOIN belvo_accounts ba ON ba.user_id = bo.user_id
LEFT JOIN belvo_transactions bt ON bt.user_id = bo.user_id
GROUP BY bo.user_id;
```

## 🔒 Security

- ✅ All tables have RLS (Row Level Security) enabled
- ✅ Users can only see their own data
- ✅ Webhook service uses service role key (full access)
- ✅ Passwords and secrets stored as environment variables
- ✅ HTTPS required for production webhooks
- ✅ All operations logged for audit trail

## 🐛 Troubleshooting

### Webhooks not being received

1. Check service logs: `docker-compose logs -f`
2. Verify service is accessible: `curl http://your-url/health`
3. Check Belvo dashboard webhook logs
4. Ensure webhook URL is correct in Belvo settings

### Data not appearing

1. Check `belvo_webhook_events` for errors
2. Verify `belvo_link_id` exists in `user_onboarding`
3. Check service logs for Belvo API errors
4. Verify Supabase service role key is correct

### Query the logs

```sql
-- Check recent webhook activity
SELECT * FROM belvo_webhook_events
WHERE link_id = 'your-link-id'
ORDER BY created_at DESC;
```

## 📚 Documentation

- **Service README**: `belvo-webhook-service/README.md`
- **Deployment Guide**: `belvo-webhook-service/DEPLOYMENT.md`
- **Integration Guide**: `belvo-webhook-service/INTEGRATION.md`
- **Belvo API Docs**: https://developers.belvo.com
- **Supabase Docs**: https://supabase.com/docs

## ✅ Checklist

- [ ] Database migrations applied
- [ ] Webhook service deployed and running
- [ ] Health check endpoint accessible
- [ ] Belvo webhooks configured
- [ ] Test user connected bank account
- [ ] Verified data appears in Supabase
- [ ] Frontend queries working
- [ ] Monitoring configured
- [ ] Production environment variables set

## 🎉 You're Done!

Your Belvo webhook integration is now complete! The service will automatically:

- Receive notifications when financial data is ready
- Fetch owners, accounts, and transactions from Belvo
- Store everything in Supabase with proper user relationships
- Keep data updated every 6 hours

Build amazing financial features with this data! 🚀
