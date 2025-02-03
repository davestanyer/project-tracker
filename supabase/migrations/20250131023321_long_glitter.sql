/*
  # Update RLS Policies for Open Access

  1. Changes
    - Allow all authenticated users to view all projects
    - Allow all authenticated users to update any project
    - Allow all authenticated users to manage team members
    - Maintain basic authentication check for security
  
  2. Security
    - Only require user to be authenticated
    - Remove ownership restrictions
*/

-- Drop existing project policies
DROP POLICY IF EXISTS "allow_select_own_and_member_projects" ON projects;
DROP POLICY IF EXISTS "allow_insert_own_projects" ON projects;
DROP POLICY IF EXISTS "allow_update_own_projects" ON projects;
DROP POLICY IF EXISTS "allow_delete_own_projects" ON projects;

-- Create open access policies for projects
CREATE POLICY "allow_select_all_projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_insert_projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_update_projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "allow_delete_projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing project_users policies
DROP POLICY IF EXISTS "project_users_select_policy" ON project_users;
DROP POLICY IF EXISTS "project_users_insert_policy" ON project_users;
DROP POLICY IF EXISTS "project_users_update_policy" ON project_users;
DROP POLICY IF EXISTS "project_users_delete_policy" ON project_users;

-- Create open access policies for project_users
CREATE POLICY "allow_select_all_project_users"
  ON project_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_insert_project_users"
  ON project_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_update_project_users"
  ON project_users
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "allow_delete_project_users"
  ON project_users
  FOR DELETE
  TO authenticated
  USING (true);

-- Update daily_logs policies for open access
DROP POLICY IF EXISTS "Users can view project logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can create their own logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON daily_logs;

CREATE POLICY "allow_select_all_logs"
  ON daily_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_insert_logs"
  ON daily_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_update_logs"
  ON daily_logs
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "allow_delete_logs"
  ON daily_logs
  FOR DELETE
  TO authenticated
  USING (true);