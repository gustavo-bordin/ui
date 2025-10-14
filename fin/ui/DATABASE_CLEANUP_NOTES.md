# Database Cleanup Notes

## Summary of Changes

The onboarding flow has been restructured:

### What Changed

- **Removed**: Welcome Step (Step 1) and User Goals Step (Step 2) from onboarding wizard
- **Moved**: User goals questions are now collected during signup in the auth screen
- **Kept**: CPF Collection (now Step 1) and Bank Connection (now Step 2)

### Database Tables

#### `user_goals` Table

- **Status**: ✅ Still in use
- **Purpose**: Stores user financial goals and preferences
- **Collection Point**: Now collected during signup (auth screen), not during onboarding wizard
- **Action**: No changes needed - table structure remains the same

#### `user_onboarding` Table

- **Status**: ✅ Still in use
- **Purpose**: Tracks onboarding progress (CPF collection and bank connection)
- **Fields Updated**:
  - `current_step` now references the simplified flow (1 = CPF, 2 = Bank Connection)
- **Action**: No changes needed

### API Endpoints

#### `/api/onboarding/goals`

- **Status**: ✅ Still in use
- **Called By**: `components/user-auth-form.tsx` (after successful signup)
- **Purpose**: Saves user responses to financial goals questions
- **Action**: No changes needed

### Migrations Applied

1. **20241226231000_create_onboarding_tables.sql** - Original table creation (no changes)
2. **20250113000000_update_user_goals_comments.sql** - Updated table comments to reflect new flow

### Optional: Data Cleanup

If you want to reset existing onboarding progress to match the new step numbering:

```sql
-- Update existing records to new step numbering
-- (Only run this if you have existing test data that needs adjustment)

-- Users who completed old step 3 (CPF) should now be at step 1
UPDATE user_onboarding
SET current_step = 1
WHERE current_step = 3;

-- Users who completed old step 4 (Bank Connection) should now be at step 2
UPDATE user_onboarding
SET current_step = 2
WHERE current_step = 4;

-- Users at old steps 1 or 2 (Welcome/Goals) should be at step 1 (CPF)
UPDATE user_onboarding
SET current_step = 1
WHERE current_step IN (1, 2);
```

**Note**: The above SQL is optional and only needed if you have existing user data. New users will automatically use the correct step numbering.

### Summary

✅ No database tables need to be dropped
✅ All existing functionality is preserved
✅ Data collection moved to earlier in the user flow (signup instead of onboarding)
✅ Onboarding wizard simplified from 4 steps to 2 steps

The `user_goals` table continues to serve its purpose - it just receives data earlier in the user journey now.
