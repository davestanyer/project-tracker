/*
  # Fix project_users policy infinite recursion

  1. Changes
    - Remove recursive policy for project_users table
    - Simplify policy to use direct user and project creator checks
    - Add separate policies for different operations

  2. Security
    - Maintain data access control
    - Prevent infinite recursion
    - Keep security model intact
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view project members" ON project_users;
DROP POLICY IF EXISTS "Project creators can manage project users" ON project_users;

-- Create new, non-recursive policies
CREATE POLICY "Users can view their own project memberships"
  ON project_users
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_users.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators can insert project users"
  ON project_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_users.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators can update project users"
  ON project_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_users.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators can delete project users"
  ON project_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_users.project_id
      AND created_by = auth.uid()
    )
  );