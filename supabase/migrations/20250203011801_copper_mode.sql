/*
  # Add working days table

  1. New Tables
    - `working_days`
      - `month_date` (date, primary key) - First day of the month
      - `working_days` (integer) - Number of working days in the month
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `working_days` table
    - Add policy for authenticated users to read working days
*/

-- Create working_days table
CREATE TABLE IF NOT EXISTS working_days (
  month_date date PRIMARY KEY,
  working_days integer NOT NULL CHECK (working_days >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE working_days ENABLE ROW LEVEL SECURITY;

-- Create policy for reading working days
CREATE POLICY "allow_read_working_days"
  ON working_days
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_working_days_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_working_days_updated_at
  BEFORE UPDATE ON working_days
  FOR EACH ROW
  EXECUTE FUNCTION update_working_days_updated_at();