-- Create bank_connections table for storing all Belvo-connected bank accounts
CREATE TABLE IF NOT EXISTS bank_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  link_id TEXT NOT NULL UNIQUE,
  institution TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bank_connections_user_id ON bank_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_link_id ON bank_connections(link_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_status ON bank_connections(status);

-- Enable RLS
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bank_connections
CREATE POLICY "Users can view their own bank connections" ON bank_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank connections" ON bank_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank connections" ON bank_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank connections" ON bank_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_bank_connections_updated_at 
  BEFORE UPDATE ON bank_connections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

