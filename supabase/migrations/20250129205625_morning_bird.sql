/*
  # Fix recursive policies

  1. Changes
    - Simplify access patterns
    - Remove potential circular dependencies
    - Optimize policy performance
    - Ensure clean security model

  2. Security
    - Maintain proper access control
    - Prevent policy recursion
    - Keep data secure
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view owned or member projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Project creators can update projects" ON projects;
DROP POLICY IF EXISTS "Project creators can delete projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own project memberships" ON project_users;
DROP POLICY IF EXISTS "Project creators can insert project users" ON project_users;
DROP POLICY IF EXISTS "Project creators can update project users" ON project_users;
DROP POLICY IF EXISTS "Project creators can delete project users" ON project_users;

-- Projects policies
CREATE POLICY "project_select_policy"
  ON projects
  FOR SELECT
  USING (
    created_by = auth.uid()
  );

CREATE POLICY "project_insert_policy"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "project_update_policy"
  ON projects
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "project_delete_policy"
  ON projects
  FOR DELETE
  USING (auth.uid() = created_by);

-- Project users policies
CREATE POLICY "project_users_select_policy"
  ON project_users
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "project_users_insert_policy"
  ON project_users
  FOR INSERT
  WITH CHECK (
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
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_users.project_id
      AND created_by = auth.uid()
    )
  );

-- Additional select policy for project members
CREATE POLICY "project_member_select_policy"
  ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_users
      WHERE project_id = id
      AND user_id = auth.uid()
    )
  );