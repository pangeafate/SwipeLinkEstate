-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('agent', 'supervisor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create revoked_tokens table for logout functionality
CREATE TABLE IF NOT EXISTS revoked_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  revoked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on token for faster lookups
CREATE INDEX idx_revoked_tokens_token ON revoked_tokens(token);

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE revoked_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY users_read_own ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Policy: Anyone can insert into revoked_tokens (for logout)
CREATE POLICY revoked_tokens_insert ON revoked_tokens
  FOR INSERT
  WITH CHECK (true);

-- Policy: No one can read revoked_tokens (internal use only)
CREATE POLICY revoked_tokens_no_read ON revoked_tokens
  FOR SELECT
  USING (false);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();