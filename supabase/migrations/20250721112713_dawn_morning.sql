/*
  # Fix RLS Policies for Profiles Table

  1. Problem
    - Infinite recursion detected in policy for relation "profiles"
    - The "Admins can manage all profiles" policy creates circular dependency
    - Policy tries to query profiles table while evaluating access to profiles table

  2. Solution
    - Drop the problematic admin policy that causes recursion
    - Create simpler, non-recursive policies
    - Use auth.uid() directly instead of subqueries to profiles table

  3. Security
    - Users can read their own profile
    - Users can read active profiles (for public display)
    - Users can update their own profile
    - Remove the recursive admin policy for now
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view all active profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read active profiles"
  ON profiles
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Note: Admin management will need to be handled differently
-- Consider using service role key for admin operations instead of RLS policies