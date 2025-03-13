/*
  # Create profiles table and storage

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `updated_at` (timestamp with time zone)
      - `username` (text)
      - `full_name` (text)
      - `avatar_url` (text, nullable)
      - `flat_number` (text, nullable)

  2. Storage
    - Create bucket for avatar images

  3. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamptz DEFAULT now(),
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  flat_number text,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name)
VALUES ('avatars', 'avatars')
ON CONFLICT DO NOTHING;

-- Enable storage bucket access
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'avatars'
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');