-- Create table for storing Belvo owners (account holders)
CREATE TABLE IF NOT EXISTS belvo_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  belvo_id TEXT UNIQUE NOT NULL,
  link_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone_number TEXT,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  second_last_name TEXT,
  address TEXT,
  internal_identification TEXT,
  collected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_data JSONB
);

-- Create table for storing Belvo accounts
CREATE TABLE IF NOT EXISTS belvo_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  belvo_id TEXT UNIQUE NOT NULL,
  link_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT,
  name TEXT,
  number TEXT,
  type TEXT,
  balance_type TEXT,
  balance_current DECIMAL(20, 2),
  balance_available DECIMAL(20, 2),
  currency TEXT,
  bank_product_id TEXT,
  internal_identification TEXT,
  public_identification_name TEXT,
  public_identification_value TEXT,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  credit_data JSONB,
  loan_data JSONB,
  funds_data JSONB,
  collected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_data JSONB
);

-- Create table for storing Belvo transactions
CREATE TABLE IF NOT EXISTS belvo_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  belvo_id TEXT UNIQUE NOT NULL,
  account_id UUID REFERENCES belvo_accounts(id) ON DELETE CASCADE,
  link_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_belvo_id TEXT,
  value_date DATE,
  accounting_date DATE,
  amount DECIMAL(20, 2),
  balance DECIMAL(20, 2),
  currency TEXT,
  description TEXT,
  observations TEXT,
  merchant_name TEXT,
  merchant_website TEXT,
  category TEXT,
  subcategory TEXT,
  reference TEXT,
  type TEXT, -- INFLOW or OUTFLOW
  status TEXT,
  credit_card_data JSONB,
  collected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_data JSONB
);

-- Create table for tracking webhook events
CREATE TABLE IF NOT EXISTS belvo_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id TEXT UNIQUE NOT NULL,
  webhook_type TEXT NOT NULL,
  process_type TEXT NOT NULL,
  webhook_code TEXT NOT NULL,
  link_id TEXT NOT NULL,
  request_id TEXT,
  external_id TEXT,
  has_errors BOOLEAN DEFAULT FALSE,
  error_details JSONB,
  data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_belvo_owners_link_id ON belvo_owners(link_id);
CREATE INDEX IF NOT EXISTS idx_belvo_owners_user_id ON belvo_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_belvo_accounts_link_id ON belvo_accounts(link_id);
CREATE INDEX IF NOT EXISTS idx_belvo_accounts_user_id ON belvo_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_belvo_transactions_account_id ON belvo_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_belvo_transactions_user_id ON belvo_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_belvo_transactions_value_date ON belvo_transactions(value_date);
CREATE INDEX IF NOT EXISTS idx_belvo_transactions_type ON belvo_transactions(type);
CREATE INDEX IF NOT EXISTS idx_belvo_webhook_events_link_id ON belvo_webhook_events(link_id);
CREATE INDEX IF NOT EXISTS idx_belvo_webhook_events_webhook_type ON belvo_webhook_events(webhook_type);

-- Enable RLS
ALTER TABLE belvo_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE belvo_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE belvo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE belvo_webhook_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for belvo_owners
CREATE POLICY "Users can view their own owners" ON belvo_owners
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for belvo_accounts
CREATE POLICY "Users can view their own accounts" ON belvo_accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for belvo_transactions
CREATE POLICY "Users can view their own transactions" ON belvo_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for belvo_webhook_events (service role only)
CREATE POLICY "Service role can manage webhook events" ON belvo_webhook_events
  FOR ALL USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_belvo_owners_updated_at 
  BEFORE UPDATE ON belvo_owners 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_belvo_accounts_updated_at 
  BEFORE UPDATE ON belvo_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_belvo_transactions_updated_at 
  BEFORE UPDATE ON belvo_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

