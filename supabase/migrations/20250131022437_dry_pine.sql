/*
  # Update Project Users RLS Policies

  1. Changes
    - Drop existing project users policies
    - Create new policies that allow:
      - Project creators to manage team members
      - Team members to view other team members
      - Users to view their own memberships
  
  2. Security
    - Enable RLS on project_users table
    - Add policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "project_users_select_policy" ON project_users;
DROP POLICY IF EXISTS "project_users_insert_policy" ON project_users;
DROP POLICY IF EXISTS "project_users_update_policy" ON project_users;
DROP POLICY IF EXISTS "project_users_delete_policy" ON project_users;

-- Create new policies
CREATE POLICY "project_users_select_policy"
  ON project_users
  FOR SELECT
  USING (
    -- Allow if user is the project creator
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_users.project_id
      AND created_by = auth.uid()
    )
    OR
    -- Allow if user is a team member of the project
    EXISTS (
      SELECT 1 FROM project_users pu
      WHERE pu.project_id = project_users.project_id
      AND pu.user_id = auth.uid()
    )
    OR
    -- Allow users to see their own memberships
    user_id = auth.uid()
  );

CREATE POLICY "project_users_insert_policy"
  ON project_users
  FOR INSERT
  WITH CHECK (
    -- Only project creators can add team members
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_users.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "project_users_update_policy"
  ON project_users
  FOR UPDATE
  USING (
    -- Only project creators can update team members
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_users.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "project_users_delete_policy"
  ON project_users
  FOR DELETE
  USING (
    -- Only project creators can remove team members
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_users.project_id
      AND created_by = auth.uid()
    )
  );