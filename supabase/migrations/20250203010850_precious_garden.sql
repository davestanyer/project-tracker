/*
  # Open monthly allocations access

  1. Changes
    - Drop existing restrictive policies
    - Create new open policies for authenticated users
    - Allow all users to manage allocations

  2. Security
    - Only authenticated users can access allocations
    - No restrictions on project membership
*/

-- Drop existing policies
DROP POLICY IF EXISTS "monthly_allocations_select" ON monthly_allocations;
DROP POLICY IF EXISTS "monthly_allocations_insert" ON monthly_allocations;
DROP POLICY IF EXISTS "monthly_allocations_update" ON monthly_allocations;
DROP POLICY IF EXISTS "monthly_allocations_delete" ON monthly_allocations;

-- Create a single open policy for all operations
CREATE POLICY "allow_all_monthly_allocations"
  ON monthly_allocations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);