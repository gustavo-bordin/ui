-- Remove redundant completed_steps column
-- current_step is sufficient for linear onboarding flow
ALTER TABLE user_onboarding 
DROP COLUMN IF EXISTS completed_steps;

