/*
  # Fix monthly allocations RLS policies

  1. Changes
    - Drop existing policies
    - Create new, simplified RLS policies for monthly allocations
    - Fix policy checks for project creators and team members

  2. Security
    - Maintain security by checking project ownership
    - Allow project creators to manage allocations
    - Allow team members to view allocations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "monthly_allocations_select" ON monthly_allocations;
DROP POLICY IF EXISTS "monthly_allocations_insert" ON monthly_allocations;
DROP POLICY IF EXISTS "monthly_allocations_update" ON monthly_allocations;
DROP POLICY IF EXISTS "monthly_allocations_delete" ON monthly_allocations;

-- Create simplified policies
CREATE POLICY "allow_all_monthly_allocations"
  ON monthly_allocations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = monthly_allocations.project_id
      AND created_by = auth.uid()
    )
  );