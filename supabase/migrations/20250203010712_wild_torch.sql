/*
  # Fix monthly allocations RLS policies

  1. Changes
    - Drop existing policies
    - Create separate policies for project creators and team members
    - Fix policy checks to properly handle team member access

  2. Security
    - Project creators can manage all allocations
    - Team members can view allocations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_all_monthly_allocations" ON monthly_allocations;

-- Create separate policies for different operations
CREATE POLICY "monthly_allocations_select"
  ON monthly_allocations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = monthly_allocations.project_id
      AND (
        p.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_users pu
          WHERE pu.project_id = p.id
          AND pu.user_id = auth.uid()
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
      SELECT 1 FROM projects p
      WHERE p.id = monthly_allocations.project_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "monthly_allocations_update"
  ON monthly_allocations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = monthly_allocations.project_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "monthly_allocations_delete"
  ON monthly_allocations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = monthly_allocations.project_id
      AND p.created_by = auth.uid()
    )
  );