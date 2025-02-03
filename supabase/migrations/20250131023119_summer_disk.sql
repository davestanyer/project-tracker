/*
  # Fix Projects RLS Policies

  1. Changes
    - Drop existing projects policies
    - Create new, non-recursive policies with proper joins
  
  2. Security
    - Enable RLS on projects table
    - Add policies for all CRUD operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "project_select_policy" ON projects;
DROP POLICY IF EXISTS "project_insert_policy" ON projects;
DROP POLICY IF EXISTS "project_update_policy" ON projects;
DROP POLICY IF EXISTS "project_delete_policy" ON projects;
DROP POLICY IF EXISTS "project_member_select_policy" ON projects;

-- Create new, non-recursive policies
CREATE POLICY "projects_select_policy"
  ON projects
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_users
      WHERE project_users.project_id = projects.id
      AND project_users.user_id = auth.uid()
    )
  );

CREATE POLICY "projects_insert_policy"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "projects_update_policy"
  ON projects
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "projects_delete_policy"
  ON projects
  FOR DELETE
  USING (auth.uid() = created_by);