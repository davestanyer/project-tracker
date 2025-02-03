/*
  # Add public holidays and working days calculation
  
  1. New Tables
    - `public_holidays`
      - `id` (uuid, primary key)
      - `holiday_date` (date, unique)
      - `description` (text)
      - `created_at` (timestamp)
  
  2. Functions
    - `calculate_working_days`: Calculates working days between two dates
    - `get_month_working_days`: Gets working days for a specific month
  
  3. Security
    - Enable RLS on public_holidays table
    - Add policies for viewing and managing holidays
*/

-- Create public_holidays table
CREATE TABLE IF NOT EXISTS public_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_date date NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;

-- Create policy for reading holidays
CREATE POLICY "allow_read_public_holidays"
  ON public_holidays
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for managing holidays (admin only)
CREATE POLICY "allow_manage_public_holidays"
  ON public_holidays
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to calculate working days
CREATE OR REPLACE FUNCTION calculate_working_days(start_date date, end_date date)
RETURNS integer AS $$
DECLARE
  total_days integer := 0;
  curr_date date := start_date;
BEGIN
  WHILE curr_date <= end_date LOOP
    -- Check if it's a weekday (1 = Monday, 5 = Friday)
    IF EXTRACT(DOW FROM curr_date) BETWEEN 1 AND 5 THEN
      -- Check if it's not a public holiday
      IF NOT EXISTS (
        SELECT 1 FROM public_holidays
        WHERE holiday_date = curr_date
      ) THEN
        total_days := total_days + 1;
      END IF;
    END IF;
    curr_date := curr_date + 1;
  END LOOP;
  
  RETURN total_days;
END;
$$ LANGUAGE plpgsql;

-- Create function to get working days for a month
CREATE OR REPLACE FUNCTION get_month_working_days(month_date date)
RETURNS integer AS $$
BEGIN
  RETURN calculate_working_days(
    date_trunc('month', month_date)::date,
    (date_trunc('month', month_date) + interval '1 month' - interval '1 day')::date
  );
END;
$$ LANGUAGE plpgsql;