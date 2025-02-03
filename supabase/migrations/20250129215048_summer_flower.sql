/*
  # Add project budgets table and remove monthly_budget from projects

  1. Changes
    - Remove monthly_budget column from projects table
    - Create new project_budgets table for monthly budget tracking
    - Add appropriate RLS policies

  2. New Tables
    - project_budgets
      - id (uuid, primary key)
      - project_id (uuid, references projects)
      - month_date (date, for the specific month)
      - budget_amount (numeric)
      - created_at (timestamptz)

  3. Security
    - Enable RLS on project_budgets table
    - Add policies for project creators and team members
*/

-- Remove monthly_budget from projects
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'monthly_budget'
  ) THEN
    ALTER TABLE projects DROP COLUMN monthly_budget;
  END IF;
END $$;

-- Create project_budgets table
CREATE TABLE IF NOT EXISTS project_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  month_date date NOT NULL,
  budget_amount numeric NOT NULL CHECK (budget_amount >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, month_date)
);

-- Enable RLS
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;

-- Project budgets policies
CREATE POLICY "project_budgets_select_policy"
  ON project_budgets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_budgets.project_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_users
          WHERE project_id = project_budgets.project_id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "project_budgets_insert_policy"
  ON project_budgets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_budgets.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "project_budgets_update_policy"
  ON project_budgets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_budgets.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "project_budgets_delete_policy"
  ON project_budgets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_budgets.project_id
      AND created_by = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_project_budgets_project_date 
ON project_budgets(project_id, month_date);