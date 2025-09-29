-- Add Belvo link ID column to user_onboarding table
ALTER TABLE user_onboarding 
ADD COLUMN IF NOT EXISTS belvo_link_id TEXT;

-- Add index for Belvo link ID lookups
CREATE INDEX IF NOT EXISTS idx_user_onboarding_belvo_link_id ON user_onboarding(belvo_link_id);
