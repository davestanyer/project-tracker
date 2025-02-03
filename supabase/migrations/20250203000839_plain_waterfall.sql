/*
  # Fix monthly allocations policies

  1. Changes
    - Drop existing policies
    - Add new policies for monthly allocations that:
      - Allow project creators to manage allocations
      - Allow team members to view allocations
      - Fix the issue with allocation updates failing
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view project allocations" ON monthly_allocations;
DROP POLICY IF EXISTS "Project creators can manage allocations" ON monthly_allocations;

-- Create new policies
CREATE POLICY "allow_select_allocations"
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
          WHERE project_id = monthly_allocations.project_id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "allow_insert_allocations"
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

CREATE POLICY "allow_update_allocations"
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

CREATE POLICY "allow_delete_allocations"
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