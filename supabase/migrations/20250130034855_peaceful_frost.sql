/*
  # Remove monthly_hours_budget column

  1. Changes
    - Remove monthly_hours_budget column from project_users table
    - This column is no longer needed since we're using monthly_allocations table
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_users' AND column_name = 'monthly_hours_budget'
  ) THEN
    ALTER TABLE project_users DROP COLUMN monthly_hours_budget;
  END IF;
END $$;