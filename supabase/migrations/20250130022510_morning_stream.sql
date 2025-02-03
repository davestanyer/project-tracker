/*
  # Add monthly allocations support

  1. New Tables
    - `monthly_allocations`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references auth.users)
      - `month_date` (date)
      - `allocated_hours` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `monthly_allocations` table
    - Add policies for project creators and team members
*/

-- Create monthly_allocations table
CREATE TABLE IF NOT EXISTS monthly_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  month_date date NOT NULL,
  allocated_hours numeric NOT NULL CHECK (allocated_hours >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id, month_date)
);

-- Enable RLS
ALTER TABLE monthly_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view project allocations"
  ON monthly_allocations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = monthly_allocations.project_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_users
          WHERE project_id = monthly_allocations.project_id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Project creators can manage allocations"
  ON monthly_allocations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = monthly_allocations.project_id
      AND created_by = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_allocations_project_date 
ON monthly_allocations(project_id, month_date);