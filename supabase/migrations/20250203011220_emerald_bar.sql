/*
  # Update project RLS policies

  1. Changes
    - Drop existing project policies
    - Create new open policies for all operations on projects table
    - Allow authenticated users to perform all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_select_own_and_member_projects" ON projects;
DROP POLICY IF EXISTS "allow_insert_own_projects" ON projects;
DROP POLICY IF EXISTS "allow_update_own_projects" ON projects;
DROP POLICY IF EXISTS "allow_delete_own_projects" ON projects;

-- Create open access policy for all operations
CREATE POLICY "allow_all_project_operations"
  ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);