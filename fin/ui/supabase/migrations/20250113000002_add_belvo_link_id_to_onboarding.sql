-- Add belvo_link_id column to user_onboarding table if it doesn't exist
-- This links the Belvo connection to the user for webhook processing

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='user_onboarding' 
        AND column_name='belvo_link_id'
    ) THEN
        ALTER TABLE user_onboarding 
        ADD COLUMN belvo_link_id TEXT;
        
        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_user_onboarding_belvo_link_id 
        ON user_onboarding(belvo_link_id);
        
        -- Add comment
        COMMENT ON COLUMN user_onboarding.belvo_link_id IS 'Belvo link ID for Open Finance connection';
    END IF;
END $$;

