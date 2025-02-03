/*
  # Add policy for viewing team member profiles

  1. Security Changes
    - Add policy to allow users to view profiles of team members in their projects
    - This enables showing user names instead of IDs in the team view
*/

-- Add policy for viewing team member profiles
CREATE POLICY "Users can view project team member profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_users pu
      JOIN projects p ON p.id = pu.project_id
      WHERE (
        -- User is either the project creator
        p.created_by = auth.uid()
        OR
        -- Or is a member of the same project
        EXISTS (
          SELECT 1 FROM project_users
          WHERE project_id = pu.project_id
          AND user_id = auth.uid()
        )
      )
      AND pu.user_id = profiles.id
    )
  );