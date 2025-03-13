/*
  # Create maintenance management tables

  1. New Tables
    - `maintenance_requests`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `status` (text)
      - `priority` (text)
      - `user_id` (uuid, references auth.users)
      - `assigned_to` (uuid, references auth.users, nullable)
      - `completed_at` (timestamp with time zone, nullable)

  2. Security
    - Enable RLS on maintenance_requests table
    - Add policies for different user roles
*/

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  user_id uuid REFERENCES auth.users NOT NULL,
  assigned_to uuid REFERENCES auth.users,
  completed_at timestamptz,
  CONSTRAINT title_length CHECK (char_length(title) >= 3)
);

-- Enable Row Level Security
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own maintenance requests"
  ON maintenance_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'maintenance_staff')
    )
  );

CREATE POLICY "Users can create maintenance requests"
  ON maintenance_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance requests"
  ON maintenance_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'maintenance_staff')
    )
  );

CREATE POLICY "Only admins and maintenance staff can delete requests"
  ON maintenance_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'maintenance_staff')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_maintenance_requests_updated_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_maintenance_requests_user_id ON maintenance_requests(user_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX idx_maintenance_requests_assigned_to ON maintenance_requests(assigned_to);