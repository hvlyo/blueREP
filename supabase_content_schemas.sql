-- Supabase Database Schemas for Content Management
-- Run this in your Supabase SQL Editor

-- ===========================================
-- NEWS AND UPDATES TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS news_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id TEXT UNIQUE NOT NULL, -- e.g., "news-001"
    category TEXT NOT NULL CHECK (category IN ('Latest', 'Event', 'Award', 'Announcement', 'Workshop', 'Production')),
    category_color TEXT NOT NULL DEFAULT 'bg-bluerep-blue', -- CSS class for styling
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT, -- Full article content (optional)
    read_more_url TEXT,
    featured BOOLEAN DEFAULT false,
    published_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published BOOLEAN DEFAULT true,
    author TEXT,
    tags TEXT[] -- Array of tags for categorization
);

-- ===========================================
-- MOMENTS/SHOWS TABLE (Simplified for Moments section)
-- ===========================================

CREATE TABLE IF NOT EXISTS shows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    show_id TEXT UNIQUE NOT NULL, -- e.g., "show-001"
    title TEXT NOT NULL,
    year TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_alt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived BOOLEAN DEFAULT false
);

-- ===========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ===========================================

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- POLICIES FOR NEWS_ARTICLES
-- ===========================================

-- Allow public reads for published articles
CREATE POLICY "Allow public reads for published articles" ON news_articles
    FOR SELECT USING (published = true);

-- Allow authenticated users to insert articles
CREATE POLICY "Allow authenticated inserts" ON news_articles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update articles
CREATE POLICY "Allow authenticated updates" ON news_articles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete articles
CREATE POLICY "Allow authenticated deletes" ON news_articles
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===========================================
-- POLICIES FOR SHOWS
-- ===========================================

-- Allow public reads for non-archived shows
CREATE POLICY "Allow public reads for active shows" ON shows
    FOR SELECT USING (archived = false);

-- Allow authenticated users to insert shows
CREATE POLICY "Allow authenticated inserts" ON shows
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update shows
CREATE POLICY "Allow authenticated updates" ON shows
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete shows
CREATE POLICY "Allow authenticated deletes" ON shows
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===========================================
-- INDEXES FOR BETTER PERFORMANCE
-- ===========================================

-- News Articles Indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_featured ON news_articles(featured);
CREATE INDEX IF NOT EXISTS idx_news_articles_article_id ON news_articles(article_id);

-- Shows Indexes
CREATE INDEX IF NOT EXISTS idx_shows_year ON shows(year DESC);
CREATE INDEX IF NOT EXISTS idx_shows_show_id ON shows(show_id);
CREATE INDEX IF NOT EXISTS idx_shows_archived ON shows(archived);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for news_articles
CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for shows
CREATE TRIGGER update_shows_updated_at 
    BEFORE UPDATE ON shows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SAMPLE DATA INSERTION
-- ===========================================

-- Insert sample news articles
INSERT INTO news_articles (article_id, category, category_color, title, excerpt, read_more_url, featured, published_date, author) VALUES
('news-001', 'Latest', 'bg-bluerep-blue', 'Auditions for Spring 2025 Production', 'We''re excited to announce auditions for our upcoming spring production. All students are welcome to try out!', '/news/auditions-spring-2025', true, '2024-12-15', 'blueREP Team'),
('news-002', 'Event', 'bg-green-500', 'Holiday Workshop Series', 'Join us for our special holiday workshop series featuring guest artists and industry professionals.', '/news/holiday-workshop-series', false, '2024-12-10', 'blueREP Team'),
('news-003', 'Award', 'bg-purple-500', 'Best Musical Production Award', 'We''re proud to announce that our latest production has won the Best Musical Production Award!', '/news/best-musical-production-award', true, '2024-12-05', 'blueREP Team'),
('news-004', 'Workshop', 'bg-orange-500', 'Vocal Training Workshop', 'Master the art of vocal performance with our intensive workshop led by professional vocal coaches.', '/news/vocal-training-workshop', false, '2024-11-28', 'blueREP Team'),
('news-005', 'Production', 'bg-red-500', 'Behind the Scenes: Spring Awakening', 'Take a peek behind the curtains and discover the magic that went into creating our latest production.', '/news/behind-scenes-spring-awakening', false, '2024-11-20', 'blueREP Team'),
('news-006', 'Announcement', 'bg-teal-500', 'New Partnership with Local Theatre', 'We''re thrilled to announce our new partnership with the Manila Theatre Guild for collaborative productions.', '/news/new-partnership', true, '2024-11-15', 'blueREP Team');

-- Insert sample shows (simplified for Moments section)
INSERT INTO shows (show_id, title, year, image_url, image_alt) VALUES
('show-001', 'Spring Awakening', '2024', '/assets/shows/spring-awakening-2024.jpg', 'Spring Awakening 2024 Production'),
('show-002', 'Rent', '2023', '/assets/shows/rent-2023.jpg', 'Rent 2023 Production'),
('show-003', 'Les Misérables', '2023', '/assets/shows/les-miserables-2023.jpg', 'Les Misérables 2023 Production'),
('show-004', 'Wicked', '2022', '/assets/shows/wicked-2022.jpg', 'Wicked 2022 Production'),
('show-005', 'Hamilton', '2022', '/assets/shows/hamilton-2022.jpg', 'Hamilton 2022 Production'),
('show-006', 'The Phantom of the Opera', '2021', '/assets/shows/phantom-2021.jpg', 'The Phantom of the Opera 2021 Production'),
('show-007', 'Chicago', '2021', '/assets/shows/chicago-2021.jpg', 'Chicago 2021 Production'),
('show-008', 'Into the Woods', '2020', '/assets/shows/into-the-woods-2020.jpg', 'Into the Woods 2020 Production'); 