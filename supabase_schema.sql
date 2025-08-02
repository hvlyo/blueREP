-- Supabase Schema for Contact Form
-- Run this in your Supabase SQL Editor

-- Create the contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from authenticated and anonymous users
CREATE POLICY "Allow anonymous inserts" ON contacts
    FOR INSERT WITH CHECK (true);

-- Create policy to allow reads only for authenticated users (optional - for admin access)
CREATE POLICY "Allow authenticated reads" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Create an index on email for potential future features
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Optional: Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 