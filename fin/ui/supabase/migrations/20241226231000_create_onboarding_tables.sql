-- Create user_goals table for storing questionnaire responses
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer_id TEXT NOT NULL,
  question_text TEXT,
  answer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_onboarding table for tracking onboarding progress
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  has_completed_onboarding BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  openfinance_connected BOOLEAN DEFAULT false,
  connection_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_question_id ON user_goals(question_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_goals
CREATE POLICY "Users can view their own goals" ON user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_onboarding
CREATE POLICY "Users can view their own onboarding" ON user_onboarding
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding" ON user_onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding" ON user_onboarding
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own onboarding" ON user_onboarding
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_goals_updated_at 
  BEFORE UPDATE ON user_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_updated_at 
  BEFORE UPDATE ON user_onboarding 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
