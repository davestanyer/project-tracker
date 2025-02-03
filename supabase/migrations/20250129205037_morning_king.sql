/*
  # Initial Schema Setup for Project Tracking Application

  1. Tables
    - projects
      - id (uuid, primary key)
      - name (text)
      - created_at (timestamp)
      - monthly_budget (numeric)
      - created_by (uuid, references auth.users)
    
    - project_users
      - project_id (uuid, references projects)
      - user_id (uuid, references auth.users)
      - rate_per_hour (numeric)
      - monthly_hours_budget (numeric)
      - created_at (timestamp)
    
    - daily_logs
      - id (uuid, primary key)
      - project_id (uuid, references projects)
      - user_id (uuid, references auth.users)
      - date (date)
      - hours_spent (numeric)
      - work_description (text[])
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Set up policies for:
      - Project access
      - User permissions
      - Log entries
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  monthly_budget numeric NOT NULL CHECK (monthly_budget >= 0),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Create project_users table
CREATE TABLE IF NOT EXISTS project_users (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rate_per_hour numeric NOT NULL CHECK (rate_per_hour >= 0),
  monthly_hours_budget numeric NOT NULL CHECK (monthly_hours_budget >= 0),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- Create daily_logs table
CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  date date NOT NULL,
  hours_spent numeric NOT NULL CHECK (hours_spent >= 0),
  work_description text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Projects Policies
CREATE POLICY "Users can view their projects"
  ON projects
  FOR SELECT
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM project_users 
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project creators can update their projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Project Users Policies
CREATE POLICY "Users can view project members"
  ON project_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_users.project_id 
      AND (created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM project_users pu 
          WHERE pu.project_id = project_users.project_id 
          AND pu.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Project creators can manage project users"
  ON project_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_users.project_id 
      AND created_by = auth.uid()
    )
  );

-- Daily Logs Policies
CREATE POLICY "Users can view project logs"
  ON daily_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = daily_logs.project_id 
      AND (created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM project_users 
          WHERE project_id = daily_logs.project_id 
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create their own logs"
  ON daily_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM project_users 
      WHERE project_id = daily_logs.project_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own logs"
  ON daily_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_users_user_id ON project_users(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_id ON daily_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);