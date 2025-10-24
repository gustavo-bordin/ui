-- Create table for storing Belvo owners (account holders)
CREATE TABLE IF NOT EXISTS belvo_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  belvo_id TEXT UNIQUE NOT NULL,
  link_id TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_belvo_webhook_events_link_id ON belvo_webhook_events(link_id);
CREATE INDEX IF NOT EXISTS idx_belvo_webhook_events_webhook_type ON belvo_webhook_events(webhook_type);

-- Enable RLS
ALTER TABLE belvo_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE belvo_webhook_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for belvo_owners
-- Users can view owners for their link_id (joined through user_onboarding)
CREATE POLICY "Users can view their own owners" ON belvo_owners
  FOR SELECT USING (
    link_id IN (
      SELECT belvo_link_id FROM user_onboarding WHERE user_id = auth.uid()
    )
  );

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
