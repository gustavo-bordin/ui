-- Add CPF column to user_onboarding table
ALTER TABLE user_onboarding 
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Add index for CPF (for potential lookups, but keep it non-unique for privacy)
CREATE INDEX IF NOT EXISTS idx_user_onboarding_cpf ON user_onboarding(cpf);

-- Update the trigger to handle the new column
-- (The existing trigger will automatically handle updated_at for the new column)
