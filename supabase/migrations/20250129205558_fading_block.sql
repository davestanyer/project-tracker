/*
  # Fix projects policies infinite recursion

  1. Changes
    - Simplify project access policies
    - Remove recursive policy patterns
    - Create separate policies for different operations
    - Ensure clean access patterns

  2. Security
    - Maintain data access control
    - Prevent infinite recursion
    - Keep security model intact
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Project creators can update their projects" ON projects;

-- Create new, non-recursive policies
CREATE POLICY "Users can view owned or member projects"
  ON projects
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_users
      WHERE project_id = projects.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project creators can update projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Project creators can delete projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = created_by);