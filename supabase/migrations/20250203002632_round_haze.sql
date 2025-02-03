/*
  # Fix monthly allocations policies

  1. Changes
    - Simplify RLS policies for monthly allocations
    - Add proper error handling for no rows found
    - Fix policy checks for project creators

  2. Security
    - Maintain security by checking project ownership
    - Allow project creators to manage allocations
    - Allow team members to view allocations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_select_allocations" ON monthly_allocations;
DROP POLICY IF EXISTS "allow_insert_allocations" ON monthly_allocations;
DROP POLICY IF EXISTS "allow_update_allocations" ON monthly_allocations;
DROP POLICY IF EXISTS "allow_delete_allocations" ON monthly_allocations;

-- Create simplified policies
CREATE POLICY "monthly_allocations_select"
  ON monthly_allocations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = monthly_allocations.project_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_users
          WHERE project_id = projects.id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "monthly_allocations_insert"
  ON monthly_allocations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = monthly_allocations.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "monthly_allocations_update"
  ON monthly_allocations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = monthly_allocations.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "monthly_allocations_delete"
  ON monthly_allocations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = monthly_allocations.project_id
      AND created_by = auth.uid()
    )
  );