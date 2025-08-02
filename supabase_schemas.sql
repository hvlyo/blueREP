-- Our Impact Section Schema
CREATE TABLE IF NOT EXISTS impact_stats (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    value VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default impact stats
INSERT INTO impact_stats (title, value, description, display_order) VALUES
('Shows Produced', '50+', 'Decades of theatrical excellence and artistic innovation', 1),
('Active Members Every Season', '200+', 'A thriving community of passionate artists and performers', 2),
('Alumni in Philippine Theatre', '∞', 'Graduates featured in Philippine theatre, TV, and film', 3),
('Awards & Recognition', '25+', 'Numerous accolades for artistic excellence and contribution to Philippine theater', 4);

-- 34th Season Core Team Section Schema
CREATE TABLE IF NOT EXISTS core_team_sections (
    id SERIAL PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL,
    section_name VARCHAR(100) NOT NULL UNIQUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default sections
INSERT INTO core_team_sections (section_title, section_name, display_order) VALUES
('34th Season Core Team', 'main_title', 0),
('The Square', 'the_square', 1),
('Organizational Board', 'organizational_board', 2),
('Artistic Board', 'artistic_board', 3);

CREATE TABLE IF NOT EXISTS core_team_members (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(100) NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (section_name) REFERENCES core_team_sections(section_name) ON DELETE CASCADE
);

-- Insert sample members for The Square (4 members)
INSERT INTO core_team_members (section_name, member_name, role, display_order) VALUES
('the_square', 'Member Name 1', 'Role 1', 1),
('the_square', 'Member Name 2', 'Role 2', 2),
('the_square', 'Member Name 3', 'Role 3', 3),
('the_square', 'Member Name 4', 'Role 4', 4);

-- Insert sample members for Organizational Board (8 members)
INSERT INTO core_team_members (section_name, member_name, role, display_order) VALUES
('organizational_board', 'Member Name 1', 'Role 1', 1),
('organizational_board', 'Member Name 2', 'Role 2', 2),
('organizational_board', 'Member Name 3', 'Role 3', 3),
('organizational_board', 'Member Name 4', 'Role 4', 4),
('organizational_board', 'Member Name 5', 'Role 5', 5),
('organizational_board', 'Member Name 6', 'Role 6', 6),
('organizational_board', 'Member Name 7', 'Role 7', 7),
('organizational_board', 'Member Name 8', 'Role 8', 8);

-- Insert sample members for Artistic Board (8 members)
INSERT INTO core_team_members (section_name, member_name, role, display_order) VALUES
('artistic_board', 'Member Name 1', 'Role 1', 1),
('artistic_board', 'Member Name 2', 'Role 2', 2),
('artistic_board', 'Member Name 3', 'Role 3', 3),
('artistic_board', 'Member Name 4', 'Role 4', 4),
('artistic_board', 'Member Name 5', 'Role 5', 5),
('artistic_board', 'Member Name 6', 'Role 6', 6),
('artistic_board', 'Member Name 7', 'Role 7', 7),
('artistic_board', 'Member Name 8', 'Role 8', 8);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_impact_stats_display_order ON impact_stats(display_order);
CREATE INDEX IF NOT EXISTS idx_core_team_sections_display_order ON core_team_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_core_team_members_section_order ON core_team_members(section_name, display_order);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_impact_stats_updated_at BEFORE UPDATE ON impact_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_team_sections_updated_at BEFORE UPDATE ON core_team_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_team_members_updated_at BEFORE UPDATE ON core_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for public read access
ALTER TABLE impact_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_team_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for impact_stats" ON impact_stats FOR SELECT USING (true);
CREATE POLICY "Public read access for core_team_sections" ON core_team_sections FOR SELECT USING (true);
CREATE POLICY "Public read access for core_team_members" ON core_team_members FOR SELECT USING (true); 