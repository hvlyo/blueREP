# blueREP Admin Dashboard

A comprehensive admin control panel for the Ateneo Blue Repertory website, built with HTML, CSS, JavaScript, and Supabase.

## 🔐 Authentication & Security

### Setup Authentication
1. **Supabase Auth Setup**: The admin panel uses Supabase email/password authentication
2. **Private Access**: The admin page (`admin.html`) should not be linked in the main website navigation
3. **Access Control**: Only authenticated users can access the dashboard

### Creating Admin Users
1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Click "Add User" and create an admin account
4. Use these credentials to log into the admin panel

## 🎯 Features

### Core Dashboard
- **7 Management Sections**: News, Moments, Events, Messages, Impact, Team Sections, Team Members
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Changes reflect immediately on the website
- **Auto-save**: Form changes are automatically saved with debouncing

### News and Updates Management
- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Rich text content management
- ✅ Auto-save functionality
- ✅ Preview content before publishing

### Moments (Photo Gallery) Management
- ✅ Upload images with drag-and-drop
- ✅ Image preview and optimization
- ✅ Gallery organization
- ✅ CRUD operations for photo entries

### Events Management
- ✅ Create upcoming shows and events
- ✅ Date and time scheduling
- ✅ Location and venue details
- ✅ Event type classification (show/custom)
- ✅ Registration link management
- ✅ Image upload for event posters

### Messages Management
- ✅ View contact form submissions
- ✅ Filter by subject type
- ✅ Sort by date, name, or alphabetical order
- ✅ Delete unwanted messages
- ✅ Message status tracking

### Impact Statistics Management
- ✅ Manage impact metrics and statistics
- ✅ Update numbers and descriptions
- ✅ Reorder display sequence
- ✅ Visual impact cards

### Team Management
- ✅ **Team Sections**: Manage organizational structure (The Square, Organizational Board, Artistic Board)
- ✅ **Team Members**: Individual member profiles with photos
- ✅ Drag-and-drop image upload for member photos
- ✅ Role and position management
- ✅ Section assignment

## 🛠 Technical Implementation

### File Structure
```
blueREP/
├── admin.html          # Main admin dashboard
├── admin.js           # Admin functionality
├── ADMIN_README.md    # This documentation
└── assets/            # Images and resources
```

### Supabase Tables Used
- `news_articles` - News and updates content
- `shows` - Moments/photo gallery
- `events` - Upcoming shows and events
- `contacts` - Contact form submissions
- `impact_stats` - Impact statistics
- `core_team_sections` - Team organizational structure
- `core_team_members` - Individual team member profiles

### Key Technologies
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for images)

## 📱 Responsive Design

### Mobile Optimization
- Touch-friendly interface
- Large tap targets (44px minimum)
- Swipe gestures for navigation
- Optimized modal layouts
- Mobile-first design approach

### Desktop Features
- Full CRUD operations
- Keyboard shortcuts
- Drag-and-drop file uploads
- Multi-column layouts
- Advanced filtering and sorting

## 🎨 Design System

### Brand Colors
- **Primary Blue**: `#0e143c` (blueREP blue)
- **Light Purple**: `#ededf7` (accent color)
- **Gradient**: `linear-gradient(135deg, #5E6BC0 0%, #1A174D 100%)`

### Typography
- **Headers**: Inter (700 weight)
- **Subheaders**: Inter (600 weight)
- **Body**: Inter (400 weight)

### Components
- **Cards**: Hover effects with elevation
- **Buttons**: Primary and secondary styles
- **Modals**: Backdrop blur with smooth animations
- **Forms**: Auto-save with visual feedback

## 🚀 Deployment

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Build command: (leave empty for static site)
   - Publish directory: `/` (root)
3. Deploy automatically on git push

### Environment Variables
No environment variables needed - all Supabase configuration is client-side for this implementation.

## 🔧 Setup Instructions

### 1. Database Setup
Ensure your Supabase database has all required tables:

```sql
-- News Articles
CREATE TABLE news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location TEXT,
  image_url TEXT,
  tag TEXT DEFAULT 'show',
  registration_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Impact Statistics
CREATE TABLE impact_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Sections
CREATE TABLE core_team_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members
CREATE TABLE core_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  section TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Authentication Setup
1. Enable Email/Password authentication in Supabase
2. Create admin user(s) in Supabase dashboard
3. Set up Row Level Security (RLS) policies if needed

### 3. File Upload Setup
For image uploads, configure Supabase Storage:
1. Create storage buckets for images
2. Set up appropriate RLS policies
3. Configure CORS if needed

## 📋 Usage Guide

### Accessing the Admin Panel
1. Navigate to `yourdomain.com/admin.html`
2. Enter admin credentials
3. Use the dashboard cards to manage different sections

### Managing Content
1. **News Articles**: Click "News and Updates" card
   - Add new articles with title and content
   - Edit existing articles
   - Delete unwanted articles

2. **Events**: Click "Shows & Events" card
   - Create new events with full details
   - Upload event images
   - Set registration links

3. **Team Members**: Click "Team Members" card
   - Add new members with photos
   - Assign roles and sections
   - Upload profile images via drag-and-drop

### Best Practices
- **Regular Backups**: Export data regularly
- **Image Optimization**: Use compressed images for faster loading
- **Content Review**: Preview changes before publishing
- **Mobile Testing**: Test on various devices

## 🔒 Security Considerations

### Authentication
- Use strong passwords for admin accounts
- Enable 2FA if available
- Regularly rotate admin credentials

### Data Protection
- Implement RLS policies in Supabase
- Regular security audits
- Monitor access logs

### File Upload Security
- Validate file types and sizes
- Scan uploaded images for malware
- Use secure file storage policies

## 🐛 Troubleshooting

### Common Issues
1. **Login Fails**: Check Supabase auth settings
2. **Images Not Loading**: Verify storage bucket permissions
3. **Data Not Saving**: Check RLS policies
4. **Mobile Issues**: Test responsive design

### Debug Mode
Enable console logging for debugging:
```javascript
// Add to admin.js for debugging
console.log('Admin panel loaded');
```

## 📞 Support

For technical support or feature requests:
- Check the Supabase documentation
- Review browser console for errors
- Test on different browsers and devices

## 🔄 Updates and Maintenance

### Regular Maintenance
- Update Supabase client libraries
- Review and update security policies
- Backup database regularly
- Monitor performance metrics

### Feature Updates
- Add new content types as needed
- Implement additional filtering options
- Enhance mobile experience
- Add analytics tracking

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge) 