/*
  # Fix Projects Policies to Prevent Recursion

  1. Changes
    - Drop all existing projects policies
    - Create simplified policies without recursive checks
    - Optimize policy conditions for better performance
  
  2. Security
    - Maintain same security rules but with simpler implementation
    - Ensure proper access control for all operations
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

-- Create simplified policies
CREATE POLICY "allow_select_own_and_member_projects"
  ON projects
  FOR SELECT
  USING (
    auth.uid() = created_by OR
    id IN (
      SELECT project_id 
      FROM project_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "allow_insert_own_projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "allow_update_own_projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "allow_delete_own_projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = created_by);