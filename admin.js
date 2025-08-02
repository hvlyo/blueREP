// Admin Dashboard JavaScript - Complete CRUD Operations

// Global variables
let currentUser = null;
let currentSection = null;
let autoSaveTimeout = null;
let currentEditingId = null;

// Supabase configuration
const supabaseUrl = 'https://mkyvwkwkvqibelypmuaw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reXZ3a3drdnFpYmVseXBtdWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjM5MzYsImV4cCI6MjA2OTYzOTkzNn0.1VVp26cZ-HbO_dr0Bpxjqa6D-ruay0DCn16v91p2kCM';

// Initialize Supabase client
let supabase;
try {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Fallback initialization
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        console.error('Supabase library not loaded');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if Supabase is available
    if (typeof window.supabase === 'undefined') {
        showError('Supabase library not loaded. Please check your internet connection and refresh the page.');
        return;
    }
    
    if (!supabase) {
        showError('Failed to initialize database connection. Please refresh the page.');
        return;
    }
    
    // Add loading state
    document.body.classList.add('loading');
    
    try {
        checkAuth();
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize application: ' + error.message);
    } finally {
        document.body.classList.remove('loading');
    }
});

// Check authentication status
async function checkAuth() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('Auth check error:', error);
            // Try automatic authentication with admin credentials
            await autoAuthenticate();
            return;
        }
        
        if (user) {
            currentUser = user;
            showDashboard();
        } else {
            // Try automatic authentication with admin credentials
            await autoAuthenticate();
        }
    } catch (error) {
        console.error('Failed to check authentication:', error);
        // Try automatic authentication with admin credentials
        await autoAuthenticate();
    }
}

// Automatic authentication with admin credentials
async function autoAuthenticate() {
    try {
        console.log('Attempting automatic authentication with admin credentials...');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'bluerep@admin.com',
            password: 'blueREP@34!'
        });
        
        if (error) {
            console.error('Auto-authentication failed:', error);
            showLogin();
            return;
        }
        
        if (data.user) {
            // Verify admin UID for additional security
            const adminUID = '3a783bdd-ffd8-4d7f-9026-0720e71205ef';
            
            if (data.user.id === adminUID) {
                currentUser = data.user;
                console.log('Automatic authentication successful. Admin permissions granted.');
                showSuccess('Welcome! You have been automatically authenticated with admin privileges.');
                showDashboard();
            } else {
                console.warn('User authenticated but UID does not match admin UID');
                currentUser = data.user;
                showSuccess('Welcome! You have been automatically authenticated.');
                showDashboard();
            }
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auto-authentication error:', error);
        showLogin();
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show login screen
function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    
    // Pre-fill admin credentials for convenience
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField && passwordField) {
        emailField.value = 'bluerep@admin.com';
        passwordField.value = 'blueREP@34!';
    }
}

// Show dashboard
function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Admin cards
    document.querySelectorAll('.admin-card').forEach(card => {
        card.addEventListener('click', () => {
            const section = card.dataset.section;
            openSection(section);
        });
    });
    
    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    
    // Close modal on outside click
    document.getElementById('admin-modal').addEventListener('click', (e) => {
        if (e.target.id === 'admin-modal') {
            closeModal();
        }
    });
    
    // Close confirmation modal on outside click
    document.getElementById('confirmation-modal').addEventListener('click', (e) => {
        if (e.target.id === 'confirmation-modal') {
            closeConfirmationModal();
        }
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showLoginError('Please enter both email and password.');
        return;
    }
    
    setLoginLoading(true);
    
    try {
        // Check if admin credentials are being used
        const adminEmail = 'bluerep@admin.com';
        const adminPassword = 'blueREP@34!';
        const adminUID = '3a783bdd-ffd8-4d7f-9026-0720e71205ef';
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        
        // Check if this is the admin user
        if (email === adminEmail && data.user.id === adminUID) {
            console.log('Admin user logged in successfully');
            showSuccess('Welcome! You have admin privileges.');
        }
        
        showDashboard();
        
    } catch (error) {
        console.error('Login error:', error);
        showLoginError(error.message || 'Login failed. Please try again.');
    } finally {
        setLoginLoading(false);
    }
}

// Handle logout
async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    showLogin();
}

// Set login loading state
function setLoginLoading(loading) {
    const loginText = document.getElementById('login-text');
    const loginSpinner = document.getElementById('login-spinner');
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    
    if (loading) {
        loginText.classList.add('hidden');
        loginSpinner.classList.remove('hidden');
        submitBtn.disabled = true;
    } else {
        loginText.classList.remove('hidden');
        loginSpinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

// Show login error
function showLoginError(message) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// Open section modal
function openSection(section) {
    currentSection = section;
    loadSectionContent(section);
    document.getElementById('admin-modal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('admin-modal').style.display = 'none';
    currentSection = null;
    currentEditingId = null;
}

// Show confirmation modal
function showConfirmationModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmation-modal');
    const titleElement = document.getElementById('confirmation-title');
    const messageElement = document.getElementById('confirmation-message');
    const confirmBtn = document.getElementById('confirmation-confirm');
    const cancelBtn = document.getElementById('confirmation-cancel');
    
    // Set content
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Show modal
    modal.style.display = 'block';
    
    // Handle confirm button
    const handleConfirm = () => {
        closeConfirmationModal();
        onConfirm();
    };
    
    // Handle cancel button
    const handleCancel = () => {
        closeConfirmationModal();
    };
    
    // Add event listeners
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    
    // Store cleanup function
    modal._cleanup = () => {
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
    };
}

// Close confirmation modal
function closeConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'none';
    
    // Clean up event listeners
    if (modal._cleanup) {
        modal._cleanup();
        delete modal._cleanup;
    }
}

// Load section content
async function loadSectionContent(section) {
    const modalContent = document.getElementById('modal-content');
    
    switch(section) {
        case 'news':
            await loadNewsSection();
            break;
        case 'moments':
            await loadMomentsSection();
            break;
        case 'events':
            await loadEventsSection();
            break;
        case 'messages':
            await loadMessagesSection();
            break;
        case 'impact':
            await loadImpactSection();
            break;
        case 'team-sections':
            await loadTeamSectionsSection();
            break;
        case 'team-members':
            await loadTeamMembersSection();
            break;
    }
}

// ===== NEWS SECTION =====
async function loadNewsSection() {
    const modalContent = document.getElementById('modal-content');
    
    try {
        const { data: articles, error } = await supabase
            .from('news_articles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">News and Updates</h2>
            
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-lehigh">Manage Articles</h3>
                <button class="btn-primary" onclick="createNewsArticle()">Add New Article</button>
            </div>
            
            <div class="space-y-4">
                ${articles && articles.length > 0 ? articles.map(article => `
                    <div class="border rounded-lg p-6 hover:bg-gray-50">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full ${article.category_color || 'bg-bluerep-blue'} text-white">${sanitizeHTML(article.category || 'Uncategorized')}</span>
                                    ${article.featured ? '<span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500 text-white">Featured</span>' : ''}
                                </div>
                                <h4 class="font-lehigh text-bluerep-blue text-lg">${sanitizeHTML(article.title || 'Untitled')}</h4>
                                <p class="text-gray-600 text-sm mt-2">${sanitizeHTML(article.excerpt || (article.content || '').substring(0, 150))}</p>
                                <div class="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                                    ${article.author ? `<span><strong>Author:</strong> ${sanitizeHTML(article.author)}</span>` : ''}
                                    ${article.published_date ? `<span><strong>Published:</strong> ${new Date(article.published_date).toLocaleDateString()}</span>` : ''}
                                    ${article.read_more_url ? `<span><strong>Read More:</strong> <a href="${article.read_more_url}" target="_blank" class="text-bluerep-blue hover:underline">Link</a></span>` : ''}
                                </div>
                                <p class="text-gray-500 text-xs mt-2">Created: ${new Date(article.created_at).toLocaleDateString()}</p>
                            </div>
                            <div class="flex gap-3 ml-6">
                                <button class="btn-secondary" onclick="editNewsArticle('${article.id}')">Edit</button>
                                <button class="btn-danger" onclick="deleteNewsArticle('${article.id}')">Delete</button>
                            </div>
                        </div>
                    </div>
                `).join('') : '<p class="text-gray-500 text-center py-12 text-lg">No articles found. Create your first article!</p>'}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading news articles:', error);
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">News and Updates</h2>
            <p class="text-red-600">Error loading articles: ${error.message}</p>
        `;
    }
}

function createNewsArticle() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Create News Article</h2>
        
        <form id="news-form" class="space-y-6">
            <div class="form-group">
                <label class="form-label">Category</label>
                <select id="news-category" class="form-input" required>
                    <option value="">Select a category...</option>
                    <option value="Latest">Latest</option>
                    <option value="Event">Event</option>
                    <option value="Award">Award</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Production">Production</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Article Title</label>
                <input type="text" id="news-title" class="form-input" placeholder="Enter article title..." required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Excerpt</label>
                <textarea id="news-excerpt" class="form-input form-textarea" placeholder="Write a brief excerpt/summary of the article..." required></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Read More URL (Optional)</label>
                <input type="url" id="news-read-more-url" class="form-input" placeholder="https://example.com/article">
            </div>
            
            <div class="form-group">
                <label class="form-label">Published Date</label>
                <input type="date" id="news-published-date" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Author</label>
                <input type="text" id="news-author" class="form-input" placeholder="Enter author name..." required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Full Article Content (Optional)</label>
                <textarea id="news-content" class="form-input form-textarea" placeholder="Write the full article content here..."></textarea>
            </div>
            
            <div class="flex gap-4 pt-4">
                <button type="submit" class="btn-primary">Save Article</button>
                <button type="button" class="btn-secondary" onclick="loadNewsSection()">Cancel</button>
            </div>
        </form>
    `;
    
    // Set default published date to today
    document.getElementById('news-published-date').value = new Date().toISOString().split('T')[0];
    
    setupAutoSave('news');
    setupNewsForm();
}

async function editNewsArticle(id) {
    currentEditingId = id;
    
    try {
        const { data: article, error } = await supabase
            .from('news_articles')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Edit News Article</h2>
            
            <form id="news-form" class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select id="news-category" class="form-input" required>
                        <option value="">Select a category...</option>
                        <option value="Latest" ${article.category === 'Latest' ? 'selected' : ''}>Latest</option>
                        <option value="Event" ${article.category === 'Event' ? 'selected' : ''}>Event</option>
                        <option value="Award" ${article.category === 'Award' ? 'selected' : ''}>Award</option>
                        <option value="Announcement" ${article.category === 'Announcement' ? 'selected' : ''}>Announcement</option>
                        <option value="Workshop" ${article.category === 'Workshop' ? 'selected' : ''}>Workshop</option>
                        <option value="Production" ${article.category === 'Production' ? 'selected' : ''}>Production</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Article Title</label>
                    <input type="text" id="news-title" class="form-input" value="${article.title || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Excerpt</label>
                    <textarea id="news-excerpt" class="form-input form-textarea" required>${article.excerpt || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Read More URL (Optional)</label>
                    <input type="url" id="news-read-more-url" class="form-input" value="${article.read_more_url || ''}" placeholder="https://example.com/article">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Published Date</label>
                    <input type="date" id="news-published-date" class="form-input" value="${article.published_date ? new Date(article.published_date).toISOString().split('T')[0] : ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Author</label>
                    <input type="text" id="news-author" class="form-input" value="${article.author || ''}" placeholder="Enter author name..." required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Full Article Content (Optional)</label>
                    <textarea id="news-content" class="form-input form-textarea">${article.content || ''}</textarea>
                </div>
                
                <div class="flex gap-4 pt-4">
                    <button type="submit" class="btn-primary">Update Article</button>
                    <button type="button" class="btn-secondary" onclick="loadNewsSection()">Cancel</button>
                </div>
            </form>
        `;
        
        setupAutoSave('news');
        setupNewsForm();
        
    } catch (error) {
        console.error('Error loading article:', error);
        alert('Error loading article: ' + error.message);
    }
}

async function deleteNewsArticle(id) {
    showConfirmationModal(
        'Delete Article',
        'Are you sure you want to delete this article? This action cannot be undone.',
        async () => {
            try {
                const { error } = await supabase
                    .from('news_articles')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                showSuccess('Article deleted successfully');
                loadNewsSection();
                
            } catch (error) {
                console.error('Error deleting article:', error);
                showError('Error deleting article: ' + error.message);
            }
        }
    );
}

function setupNewsForm() {
    const form = document.getElementById('news-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const category = document.getElementById('news-category').value.trim();
        const title = document.getElementById('news-title').value.trim();
        const excerpt = document.getElementById('news-excerpt').value.trim();
        const readMoreUrl = document.getElementById('news-read-more-url').value.trim();
        const publishedDate = document.getElementById('news-published-date').value;
        const author = document.getElementById('news-author').value.trim();
        const content = document.getElementById('news-content').value.trim();
        
        if (!validateForm('news-form')) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Additional validation for URL format
        if (readMoreUrl && !isValidUrl(readMoreUrl)) {
            alert('Please enter a valid URL for the Read More link.');
            return;
        }
        
        // Generate article_id if creating new article
        const articleId = currentEditingId ? null : `news-${Date.now()}`;
        
        // Set category color based on category
        const categoryColors = {
            'Latest': 'bg-bluerep-blue',
            'Event': 'bg-green-500',
            'Award': 'bg-yellow-500',
            'Announcement': 'bg-red-500',
            'Workshop': 'bg-purple-500',
            'Production': 'bg-orange-500'
        };
        const categoryColor = categoryColors[category] || 'bg-bluerep-blue';
        
        try {
            if (currentEditingId) {
                // Update existing article
                const confirmed = confirm('Are you sure you want to update this article?');
                if (!confirmed) return;
                
                const { error } = await supabase
                    .from('news_articles')
                    .update({ 
                        category,
                        title, 
                        excerpt,
                        read_more_url: readMoreUrl || null,
                        published_date: publishedDate,
                        author,
                        content: content || null,
                        category_color: categoryColor
                    })
                    .eq('id', currentEditingId);
                
                if (error) throw error;
                showSuccess('Article updated successfully');
            } else {
                // Create new article
                const { error } = await supabase
                    .from('news_articles')
                    .insert([{ 
                        article_id: articleId,
                        category,
                        title, 
                        excerpt,
                        read_more_url: readMoreUrl || null,
                        published_date: publishedDate,
                        author,
                        content: content || null,
                        category_color: categoryColor
                    }]);
                
                if (error) throw error;
                showSuccess('Article created successfully');
            }
            
            loadNewsSection();
            
        } catch (error) {
            console.error('Error saving article:', error);
            alert('Error saving article: ' + error.message);
        }
    });
}

// ===== MOMENTS SECTION =====
async function loadMomentsSection() {
    const modalContent = document.getElementById('modal-content');
    
    try {
        const { data: moments, error } = await supabase
            .from('shows')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Moments</h2>
            
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-lehigh">Manage Photo Gallery</h3>
                <button class="btn-primary" onclick="createMoment()">Add New Moment</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${moments && moments.length > 0 ? moments.map(moment => `
                    <div class="border rounded-lg p-6 hover:bg-gray-50">
                        <img src="${moment.image_url || '/assets/default-image.jpg'}" alt="${moment.image_alt || moment.title || 'Moment'}" class="w-full h-40 object-cover rounded mb-4">
                        <h4 class="font-lehigh text-bluerep-blue text-lg">${sanitizeHTML(moment.title || 'Untitled')}</h4>
                        <p class="text-gray-600 text-sm mt-2">
                            <strong>Show ID:</strong> ${sanitizeHTML(moment.show_id || 'N/A')}<br>
                            <strong>Year:</strong> ${sanitizeHTML(moment.year || 'N/A')}
                        </p>
                        <div class="flex gap-3 mt-4">
                            <button class="btn-secondary" onclick="editMoment('${moment.id}')">Edit</button>
                            <button class="btn-danger" onclick="deleteMoment('${moment.id}')">Delete</button>
                        </div>
                    </div>
                `).join('') : '<p class="text-gray-500 text-center py-12 text-lg col-span-full">No moments found. Create your first moment!</p>'}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading moments:', error);
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Moments</h2>
            <p class="text-red-600">Error loading moments: ${error.message}</p>
            <button class="btn-secondary mt-4" onclick="loadMomentsSection()">Retry</button>
        `;
    }
}

function createMoment() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Add New Moment</h2>
        
        <form id="moment-form" class="space-y-6">
            <div class="form-group">
                <label class="form-label">Show ID</label>
                <input type="text" id="moment-show-id" class="form-input" placeholder="e.g., show-001" required>
                <small class="text-gray-500">Unique identifier for this show (e.g., show-001, show-002)</small>
            </div>
            
            <div class="form-group">
                <label class="form-label">Show Title</label>
                <input type="text" id="moment-title" class="form-input" placeholder="Enter show title..." required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Year</label>
                <input type="text" id="moment-year" class="form-input" placeholder="e.g., 2024" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Image URL</label>
                <input type="url" id="moment-image-url" class="form-input" placeholder="https://example.com/image.jpg" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Image Alt Text</label>
                <input type="text" id="moment-image-alt" class="form-input" placeholder="Description of the image for accessibility">
            </div>
            
            <div class="flex gap-4 pt-4">
                <button type="submit" class="btn-primary">Save Moment</button>
                <button type="button" class="btn-secondary" onclick="loadMomentsSection()">Cancel</button>
            </div>
        </form>
    `;
    
    setupMomentForm();
}

// ===== EVENTS SECTION =====
async function loadEventsSection() {
    const modalContent = document.getElementById('modal-content');
    
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });
        
        if (error) throw error;
        
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Shows & Events</h2>
            
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-lehigh">Manage Events</h3>
                <button class="btn-primary" onclick="createEvent()">Add New Event</button>
            </div>
            
            <div class="space-y-6">
                ${events && events.length > 0 ? events.map(event => `
                    <div class="border rounded-lg p-6 hover:bg-gray-50">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-lehigh text-bluerep-blue text-lg">${sanitizeHTML(event.name || 'Untitled')}</h4>
                                <p class="text-gray-600 text-sm mt-2">${sanitizeHTML(event.description || 'No description')}</p>
                                <p class="text-gray-500 text-xs mt-3">
                                    Date: ${new Date(event.date).toLocaleDateString()} | 
                                    Time: ${event.time || 'TBD'} | 
                                    Location: ${event.location || 'TBD'} |
                                    Type: ${event.tag || 'show'}
                                </p>
                            </div>
                            <div class="flex gap-3 ml-6">
                                <button class="btn-secondary" onclick="editEvent('${event.id}')">Edit</button>
                                <button class="btn-danger" onclick="deleteEvent('${event.id}')">Delete</button>
                            </div>
                        </div>
                    </div>
                `).join('') : '<p class="text-gray-500 text-center py-12 text-lg">No events found. Create your first event!</p>'}
            </div>
        `;
        
    } catch (error) {
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Shows & Events</h2>
            <p class="text-red-600">Error loading events: ${error.message}</p>
        `;
    }
}

function createEvent() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Create New Event</h2>
        
        <form id="event-form" class="space-y-4">
            <div>
                <label class="form-label">Event Name</label>
                <input type="text" id="event-name" class="form-input" required>
            </div>
            
            <div>
                <label class="form-label">Description</label>
                <textarea id="event-description" class="form-input form-textarea" required></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="form-label">Date</label>
                    <input type="date" id="event-date" class="form-input" required>
                </div>
                
                <div>
                    <label class="form-label">Time</label>
                    <input type="time" id="event-time" class="form-input" required>
                </div>
            </div>
            
            <div>
                <label class="form-label">Location</label>
                <input type="text" id="event-location" class="form-input" required>
            </div>
            
            <div>
                <label class="form-label">Event Type</label>
                <select id="event-tag" class="form-input" required>
                    <option value="show">Show</option>
                    <option value="custom">Custom Event</option>
                </select>
            </div>
            
            <div>
                <label class="form-label">Registration Link (optional)</label>
                <input type="url" id="event-registration-link" class="form-input">
            </div>
            
            <div>
                <label class="form-label">Image</label>
                <div class="drag-drop-area" id="image-drop-area">
                    <p>Drag and drop an image here or click to select</p>
                    <input type="file" id="event-image" accept="image/*" class="hidden">
                </div>
            </div>
            
            <div class="flex gap-4">
                <button type="submit" class="btn-primary">Save Event</button>
                <button type="button" class="btn-secondary" onclick="loadEventsSection()">Cancel</button>
            </div>
        </form>
    `;
    
    setupDragAndDrop();
    setupEventForm();
}

// ===== MESSAGES SECTION =====
async function loadMessagesSection() {
    const modalContent = document.getElementById('modal-content');
    
    try {
        const { data: messages, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Messages</h2>
            
            <div class="filter-container">
                <select id="filter-subject" class="filter-select" onchange="filterMessages()">
                    <option value="">All Subjects</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Ticket Information">Ticket Information</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Other">Other</option>
                </select>
                
                <select id="filter-sort" class="filter-select" onchange="filterMessages()">
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                </select>
            </div>
            
            <div class="space-y-4" id="messages-list">
                ${messages.map(message => `
                    <div class="border rounded-lg p-4 hover:bg-gray-50" data-subject="${message.subject}" data-name="${message.name}" data-date="${message.created_at}">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-lehigh text-bluerep-blue">${message.name}</h4>
                                <p class="text-gray-600 text-sm mt-1">${message.email}</p>
                                <p class="text-gray-600 text-sm">Subject: ${message.subject}</p>
                                <p class="text-gray-600 text-sm mt-2">${message.message}</p>
                                <p class="text-gray-500 text-xs mt-2">Received: ${new Date(message.created_at).toLocaleString()}</p>
                            </div>
                            <div class="flex gap-2">
                                <button class="btn-secondary text-sm bg-red-100 text-red-700" onclick="deleteMessage('${message.id}')">Delete</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Messages</h2>
            <p class="text-red-600">Error loading messages: ${error.message}</p>
        `;
    }
}

function filterMessages() {
    const subjectFilter = document.getElementById('filter-subject').value;
    const sortFilter = document.getElementById('filter-sort').value;
    const messages = document.querySelectorAll('#messages-list > div');
    
    messages.forEach(message => {
        const subject = message.dataset.subject;
        const shouldShow = !subjectFilter || subject === subjectFilter;
        message.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Sort messages
    const messagesArray = Array.from(messages);
    messagesArray.sort((a, b) => {
        switch(sortFilter) {
            case 'date-desc':
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            case 'date-asc':
                return new Date(a.dataset.date) - new Date(b.dataset.date);
            case 'name-asc':
                return a.dataset.name.localeCompare(b.dataset.name);
            case 'name-desc':
                return b.dataset.name.localeCompare(a.dataset.name);
            default:
                return 0;
        }
    });
    
    const container = document.getElementById('messages-list');
    messagesArray.forEach(message => container.appendChild(message));
}

async function deleteMessage(id) {
    showConfirmationModal(
        'Delete Message',
        'Are you sure you want to delete this message? This action cannot be undone.',
        async () => {
            try {
                const { error } = await supabase
                    .from('contacts')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                showSuccess('Message deleted successfully');
                loadMessagesSection();
                
            } catch (error) {
                console.error('Error deleting message:', error);
                showError('Error deleting message: ' + error.message);
            }
        }
    );
}

// ===== IMPACT SECTION =====
async function loadImpactSection() {
    const modalContent = document.getElementById('modal-content');
    
    try {
        const { data: impacts, error } = await supabase
            .from('impact_stats')
            .select('*')
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Our Impact</h2>
            
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-lehigh">Manage Impact Statistics</h3>
                <button class="btn-primary" onclick="createImpact()">Add New Statistic</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${impacts.map(impact => `
                    <div class="border rounded-lg p-4 hover:bg-gray-50">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-lehigh text-bluerep-blue">${impact.title}</h4>
                                <p class="text-2xl font-bold text-bluerep-blue">${impact.value}</p>
                                <p class="text-gray-600 text-sm">${impact.description}</p>
                                <p class="text-gray-500 text-xs mt-2">Order: ${impact.display_order}</p>
                            </div>
                            <div class="flex gap-2">
                                <button class="btn-secondary text-sm" onclick="editImpact('${impact.id}')">Edit</button>
                                <button class="btn-secondary text-sm bg-red-100 text-red-700" onclick="deleteImpact('${impact.id}')">Delete</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Our Impact</h2>
            <p class="text-red-600">Error loading impact stats: ${error.message}</p>
        `;
    }
}

// ===== TEAM SECTIONS =====
async function loadTeamSectionsSection() {
    const modalContent = document.getElementById('modal-content');
    
    try {
        const { data: sections, error } = await supabase
            .from('core_team_sections')
            .select('*')
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Team Sections</h2>
            
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-lehigh">Manage Organizational Structure</h3>
                <button class="btn-primary" onclick="createTeamSection()">Add New Section</button>
            </div>
            
            <div class="space-y-4">
                ${sections.map(section => `
                    <div class="border rounded-lg p-4 hover:bg-gray-50">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-lehigh text-bluerep-blue">${section.title}</h4>
                                <p class="text-gray-600 text-sm">${section.description}</p>
                                <p class="text-gray-500 text-xs mt-2">Order: ${section.display_order}</p>
                            </div>
                            <div class="flex gap-2">
                                <button class="btn-secondary text-sm" onclick="editTeamSection('${section.id}')">Edit</button>
                                <button class="btn-secondary text-sm bg-red-100 text-red-700" onclick="deleteTeamSection('${section.id}')">Delete</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Team Sections</h2>
            <p class="text-red-600">Error loading team sections: ${error.message}</p>
        `;
    }
}

// ===== TEAM MEMBERS =====
async function loadTeamMembersSection() {
    const modalContent = document.getElementById('modal-content');
    
    try {
        const { data: members, error } = await supabase
            .from('core_team_members')
            .select('*')
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Team Members</h2>
            
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-lehigh">Manage Team Member Profiles</h3>
                <button class="btn-primary" onclick="createTeamMember()">Add New Member</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${members.map(member => `
                    <div class="border rounded-lg p-4 hover:bg-gray-50">
                        <div class="text-center mb-3">
                            <img src="${member.image_url || '/assets/default-avatar.png'}" alt="${member.name}" class="w-20 h-20 rounded-full object-cover mx-auto">
                        </div>
                        <div class="text-center">
                            <h4 class="font-lehigh text-bluerep-blue">${member.name}</h4>
                            <p class="text-gray-600 text-sm">${member.role}</p>
                            <p class="text-gray-500 text-xs">${member.section}</p>
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button class="btn-secondary text-sm" onclick="editTeamMember('${member.id}')">Edit</button>
                            <button class="btn-secondary text-sm bg-red-100 text-red-700" onclick="deleteTeamMember('${member.id}')">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Team Members</h2>
            <p class="text-red-600">Error loading team members: ${error.message}</p>
        `;
    }
}

function createTeamMember() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h2 class="text-2xl font-fjalla text-bluerep-blue mb-6">Add New Team Member</h2>
        
        <form id="member-form" class="space-y-4">
            <div>
                <label class="form-label">Name</label>
                <input type="text" id="member-name" class="form-input" required>
            </div>
            
            <div>
                <label class="form-label">Role/Position</label>
                <input type="text" id="member-role" class="form-input" required>
            </div>
            
            <div>
                <label class="form-label">Section</label>
                <select id="member-section" class="form-input" required>
                    <option value="">Select Section</option>
                    <option value="The Square">The Square</option>
                    <option value="Organizational Board">Organizational Board</option>
                    <option value="Artistic Board">Artistic Board</option>
                </select>
            </div>
            
            <div>
                <label class="form-label">Profile Image</label>
                <div class="drag-drop-area" id="image-drop-area">
                    <p>Drag and drop an image here or click to select</p>
                    <input type="file" id="member-image" accept="image/*" class="hidden">
                </div>
            </div>
            
            <div class="flex gap-4">
                <button type="submit" class="btn-primary">Save Member</button>
                <button type="button" class="btn-secondary" onclick="loadTeamMembersSection()">Cancel</button>
            </div>
        </form>
    `;
    
    setupDragAndDrop();
    setupMemberForm();
}

// ===== UTILITY FUNCTIONS =====

// Sanitize HTML content to prevent XSS
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validate form fields
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        if (!value) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
            input.classList.add('success');
        }
    });
    
    return isValid;
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Setup auto-save functionality
function setupAutoSave(section) {
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                console.log(`Auto-saving ${section}...`);
                // Auto-save logic can be implemented here
            }, 2000);
        });
    });
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const dropArea = document.getElementById('image-drop-area');
    const fileInput = dropArea.querySelector('input[type="file"]');
    
    if (!dropArea || !fileInput) return;
    
    // Click to select file
    dropArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop events
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

// Handle file upload
async function handleFileUpload(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('File size too large. Please select an image smaller than 5MB.');
        return;
    }
    
    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP).');
        return;
    }
    
    try {
        // Show loading state
        const dropArea = document.getElementById('image-drop-area');
        dropArea.innerHTML = '<p class="text-gray-600">Processing image...</p>';
        
        // In a real implementation, you would upload to Supabase Storage
        // For now, we'll just show a preview
        const reader = new FileReader();
        reader.onload = (e) => {
            dropArea.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="w-full h-32 object-cover rounded">
                <p class="text-sm text-gray-600 mt-2">Image selected: ${file.name}</p>
                <p class="text-xs text-gray-500">Size: ${(file.size / 1024 / 1024).toFixed(2)}MB</p>
            `;
        };
        reader.onerror = () => {
            alert('Error reading file. Please try again.');
            dropArea.innerHTML = `
                <p>Drag and drop an image here or click to select</p>
                <input type="file" accept="image/*" class="hidden">
            `;
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('File upload error:', error);
        alert('Error uploading file: ' + error.message);
    }
}

// Setup form handlers
function setupMomentForm() {
    const form = document.getElementById('moment-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm('moment-form')) {
            return;
        }
        
        const showId = document.getElementById('moment-show-id').value.trim();
        const title = document.getElementById('moment-title').value.trim();
        const year = document.getElementById('moment-year').value.trim();
        const imageUrl = document.getElementById('moment-image-url').value.trim();
        const imageAlt = document.getElementById('moment-image-alt').value.trim();
        
        // Validate required fields
        if (!showId || !title || !year || !imageUrl) {
            showError('Please fill in all required fields.');
            return;
        }
        
        // Validate show ID format
        if (!/^show-\d+$/.test(showId)) {
            showError('Show ID must be in format: show-001, show-002, etc.');
            return;
        }
        
        // Validate year format
        if (!/^\d{4}$/.test(year)) {
            showError('Year must be a 4-digit number (e.g., 2024).');
            return;
        }
        
        // Validate URL format
        if (!isValidUrl(imageUrl)) {
            showError('Please enter a valid image URL.');
            return;
        }
        
        const momentData = {
            show_id: showId,
            title: title,
            year: year,
            image_url: imageUrl,
            image_alt: imageAlt || null
        };
        
        try {
            if (currentEditingId) {
                showConfirmationModal(
                    'Update Moment',
                    'Are you sure you want to update this moment?',
                    async () => {
                        try {
                            const { error } = await supabase
                                .from('shows')
                                .update(momentData)
                                .eq('id', currentEditingId);
                            
                            if (error) throw error;
                            
                            showSuccess('Moment updated successfully');
                            loadMomentsSection();
                            
                        } catch (error) {
                            console.error('Error updating moment:', error);
                            showError('Error updating moment: ' + error.message);
                        }
                    }
                );
            } else {
                const { error } = await supabase
                    .from('shows')
                    .insert([momentData]);
                
                if (error) throw error;
                
                showSuccess('Moment created successfully');
                loadMomentsSection();
            }
            
        } catch (error) {
            console.error('Error saving moment:', error);
            showError('Error saving moment: ' + error.message);
        }
    });
}

function setupEventForm() {
    const form = document.getElementById('event-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('event-name').value.trim();
        const description = document.getElementById('event-description').value.trim();
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const location = document.getElementById('event-location').value.trim();
        const tag = document.getElementById('event-tag').value;
        const registrationLink = document.getElementById('event-registration-link').value.trim();
        
        if (!name || !description || !date || !time || !location) {
            alert('Please fill in all required fields.');
            return;
        }
        
        try {
            const eventData = {
                name,
                description,
                date,
                time,
                location,
                tag,
                registration_link: registrationLink || null
            };
            
            if (currentEditingId) {
                const confirmed = confirm('Are you sure you want to update this event?');
                if (!confirmed) return;
                
                const { error } = await supabase
                    .from('events')
                    .update(eventData)
                    .eq('id', currentEditingId);
                
                if (error) throw error;
                console.log('Event updated successfully');
            } else {
                const { error } = await supabase
                    .from('events')
                    .insert([eventData]);
                
                if (error) throw error;
                console.log('Event created successfully');
            }
            
            loadEventsSection();
            
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Error saving event: ' + error.message);
        }
    });
}

function setupMemberForm() {
    const form = document.getElementById('member-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('member-name').value.trim();
        const role = document.getElementById('member-role').value.trim();
        const section = document.getElementById('member-section').value;
        
        if (!name || !role || !section) {
            alert('Please fill in all required fields.');
            return;
        }
        
        try {
            const memberData = {
                name,
                role,
                section
            };
            
            if (currentEditingId) {
                const confirmed = confirm('Are you sure you want to update this team member?');
                if (!confirmed) return;
                
                const { error } = await supabase
                    .from('core_team_members')
                    .update(memberData)
                    .eq('id', currentEditingId);
                
                if (error) throw error;
                console.log('Team member updated successfully');
            } else {
                const { error } = await supabase
                    .from('core_team_members')
                    .insert([memberData]);
                
                if (error) throw error;
                console.log('Team member created successfully');
            }
            
            loadTeamMembersSection();
            
        } catch (error) {
            console.error('Error saving team member:', error);
            alert('Error saving team member: ' + error.message);
        }
    });
}

// ===== MISSING FUNCTIONS =====

// Impact functions
function createImpact() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Add New Impact Statistic</h2>
        
        <form id="impact-form" class="space-y-6">
            <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" id="impact-title" class="form-input" placeholder="Enter statistic title..." required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Value</label>
                <input type="text" id="impact-value" class="form-input" placeholder="Enter statistic value..." required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="impact-description" class="form-input form-textarea" placeholder="Enter description..." required></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Display Order</label>
                <input type="number" id="impact-order" class="form-input" value="0" min="0">
            </div>
            
            <div class="flex gap-4 pt-4">
                <button type="submit" class="btn-primary">Save Statistic</button>
                <button type="button" class="btn-secondary" onclick="loadImpactSection()">Cancel</button>
            </div>
        </form>
    `;
    
    setupImpactForm();
}

async function editImpact(id) {
    currentEditingId = id;
    
    try {
        const { data: impact, error } = await supabase
            .from('impact_stats')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Edit Impact Statistic</h2>
            
            <form id="impact-form" class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" id="impact-title" class="form-input" value="${impact.title || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Value</label>
                    <input type="text" id="impact-value" class="form-input" value="${impact.value || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="impact-description" class="form-input form-textarea" required>${impact.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Display Order</label>
                    <input type="number" id="impact-order" class="form-input" value="${impact.display_order || 0}" min="0">
                </div>
                
                <div class="flex gap-4 pt-4">
                    <button type="submit" class="btn-primary">Update Statistic</button>
                    <button type="button" class="btn-secondary" onclick="loadImpactSection()">Cancel</button>
                </div>
            </form>
        `;
        
        setupImpactForm();
        
    } catch (error) {
        console.error('Error loading impact:', error);
        alert('Error loading impact: ' + error.message);
    }
}

async function deleteImpact(id) {
    const confirmed = confirm('Are you sure you want to delete this impact statistic? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
        const { error } = await supabase
            .from('impact_stats')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        loadImpactSection();
        
    } catch (error) {
        console.error('Error deleting impact:', error);
        alert('Error deleting impact: ' + error.message);
    }
}

function setupImpactForm() {
    const form = document.getElementById('impact-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('impact-title').value.trim();
        const value = document.getElementById('impact-value').value.trim();
        const description = document.getElementById('impact-description').value.trim();
        const displayOrder = parseInt(document.getElementById('impact-order').value) || 0;
        
        if (!title || !value || !description) {
            alert('Please fill in all required fields.');
            return;
        }
        
        try {
            if (currentEditingId) {
                const confirmed = confirm('Are you sure you want to update this impact statistic?');
                if (!confirmed) return;
                
                const { error } = await supabase
                    .from('impact_stats')
                    .update({ title, value, description, display_order: displayOrder })
                    .eq('id', currentEditingId);
                
                if (error) throw error;
                console.log('Impact updated successfully');
            } else {
                const { error } = await supabase
                    .from('impact_stats')
                    .insert([{ title, value, description, display_order: displayOrder }]);
                
                if (error) throw error;
                console.log('Impact created successfully');
            }
            
            loadImpactSection();
            
        } catch (error) {
            console.error('Error saving impact:', error);
            alert('Error saving impact: ' + error.message);
        }
    });
}

// Team Section functions
function createTeamSection() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Add New Team Section</h2>
        
        <form id="team-section-form" class="space-y-6">
            <div class="form-group">
                <label class="form-label">Section Title</label>
                <input type="text" id="section-title" class="form-input" placeholder="Enter section title..." required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="section-description" class="form-input form-textarea" placeholder="Enter section description..." required></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Display Order</label>
                <input type="number" id="section-order" class="form-input" value="0" min="0">
            </div>
            
            <div class="flex gap-4 pt-4">
                <button type="submit" class="btn-primary">Save Section</button>
                <button type="button" class="btn-secondary" onclick="loadTeamSectionsSection()">Cancel</button>
            </div>
        </form>
    `;
    
    setupTeamSectionForm();
}

async function editTeamSection(id) {
    currentEditingId = id;
    
    try {
        const { data: section, error } = await supabase
            .from('core_team_sections')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Edit Team Section</h2>
            
            <form id="team-section-form" class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Section Title</label>
                    <input type="text" id="section-title" class="form-input" value="${section.title || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="section-description" class="form-input form-textarea" required>${section.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Display Order</label>
                    <input type="number" id="section-order" class="form-input" value="${section.display_order || 0}" min="0">
                </div>
                
                <div class="flex gap-4 pt-4">
                    <button type="submit" class="btn-primary">Update Section</button>
                    <button type="button" class="btn-secondary" onclick="loadTeamSectionsSection()">Cancel</button>
                </div>
            </form>
        `;
        
        setupTeamSectionForm();
        
    } catch (error) {
        console.error('Error loading team section:', error);
        alert('Error loading team section: ' + error.message);
    }
}

async function deleteTeamSection(id) {
    const confirmed = confirm('Are you sure you want to delete this team section? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
        const { error } = await supabase
            .from('core_team_sections')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        loadTeamSectionsSection();
        
    } catch (error) {
        console.error('Error deleting team section:', error);
        alert('Error deleting team section: ' + error.message);
    }
}

function setupTeamSectionForm() {
    const form = document.getElementById('team-section-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('section-title').value.trim();
        const description = document.getElementById('section-description').value.trim();
        const displayOrder = parseInt(document.getElementById('section-order').value) || 0;
        
        if (!title || !description) {
            alert('Please fill in all required fields.');
            return;
        }
        
        try {
            if (currentEditingId) {
                const confirmed = confirm('Are you sure you want to update this team section?');
                if (!confirmed) return;
                
                const { error } = await supabase
                    .from('core_team_sections')
                    .update({ title, description, display_order: displayOrder })
                    .eq('id', currentEditingId);
                
                if (error) throw error;
                console.log('Team section updated successfully');
            } else {
                const { error } = await supabase
                    .from('core_team_sections')
                    .insert([{ title, description, display_order: displayOrder }]);
                
                if (error) throw error;
                console.log('Team section created successfully');
            }
            
            loadTeamSectionsSection();
            
        } catch (error) {
            console.error('Error saving team section:', error);
            alert('Error saving team section: ' + error.message);
        }
    });
}

// Team Member functions
async function editTeamMember(id) {
    currentEditingId = id;
    
    try {
        const { data: member, error } = await supabase
            .from('core_team_members')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Edit Team Member</h2>
            
            <form id="member-form" class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Name</label>
                    <input type="text" id="member-name" class="form-input" value="${member.name || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Role/Position</label>
                    <input type="text" id="member-role" class="form-input" value="${member.role || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Section</label>
                    <select id="member-section" class="form-input" required>
                        <option value="">Select Section</option>
                        <option value="The Square" ${member.section === 'The Square' ? 'selected' : ''}>The Square</option>
                        <option value="Organizational Board" ${member.section === 'Organizational Board' ? 'selected' : ''}>Organizational Board</option>
                        <option value="Artistic Board" ${member.section === 'Artistic Board' ? 'selected' : ''}>Artistic Board</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Profile Image</label>
                    <div class="drag-drop-area" id="image-drop-area">
                        <p>Drag and drop an image here or click to select</p>
                        <input type="file" id="member-image" accept="image/*" class="hidden">
                    </div>
                </div>
                
                <div class="flex gap-4 pt-4">
                    <button type="submit" class="btn-primary">Update Member</button>
                    <button type="button" class="btn-secondary" onclick="loadTeamMembersSection()">Cancel</button>
                </div>
            </form>
        `;
        
        setupDragAndDrop();
        setupMemberForm();
        
    } catch (error) {
        console.error('Error loading team member:', error);
        alert('Error loading team member: ' + error.message);
    }
}

async function deleteTeamMember(id) {
    const confirmed = confirm('Are you sure you want to delete this team member? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
        const { error } = await supabase
            .from('core_team_members')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        loadTeamMembersSection();
        
    } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Error deleting team member: ' + error.message);
    }
}

// Moment functions
async function editMoment(id) {
    currentEditingId = id;
    
    try {
        const { data: moment, error } = await supabase
            .from('shows')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Edit Moment</h2>
            
            <form id="moment-form" class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Show ID</label>
                    <input type="text" id="moment-show-id" class="form-input" value="${moment.show_id || ''}" required>
                    <small class="text-gray-500">Unique identifier for this show (e.g., show-001, show-002)</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Show Title</label>
                    <input type="text" id="moment-title" class="form-input" value="${moment.title || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Year</label>
                    <input type="text" id="moment-year" class="form-input" value="${moment.year || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Image URL</label>
                    <input type="url" id="moment-image-url" class="form-input" value="${moment.image_url || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Image Alt Text</label>
                    <input type="text" id="moment-image-alt" class="form-input" value="${moment.image_alt || ''}" placeholder="Description of the image for accessibility">
                </div>
                
                <div class="flex gap-4 pt-4">
                    <button type="submit" class="btn-primary">Update Moment</button>
                    <button type="button" class="btn-secondary" onclick="loadMomentsSection()">Cancel</button>
                </div>
            </form>
        `;
        
        setupMomentForm();
        
    } catch (error) {
        console.error('Error loading moment:', error);
        showError('Error loading moment: ' + error.message);
        loadMomentsSection(); // Return to moments list
    }
}

async function deleteMoment(id) {
    showConfirmationModal(
        'Delete Moment',
        'Are you sure you want to delete this moment? This action cannot be undone.',
        async () => {
            try {
                const { error } = await supabase
                    .from('shows')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                showSuccess('Moment deleted successfully');
                loadMomentsSection();
                
            } catch (error) {
                console.error('Error deleting moment:', error);
                showError('Error deleting moment: ' + error.message);
            }
        }
    );
}

// Event functions
async function editEvent(id) {
    currentEditingId = id;
    
    try {
        const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <h2 class="text-2xl font-fjalla text-bluerep-blue mb-8">Edit Event</h2>
            
            <form id="event-form" class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Event Name</label>
                    <input type="text" id="event-name" class="form-input" value="${event.name || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="event-description" class="form-input form-textarea" required>${event.description || ''}</textarea>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" id="event-date" class="form-input" value="${event.date || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Time</label>
                        <input type="time" id="event-time" class="form-input" value="${event.time || ''}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Location</label>
                    <input type="text" id="event-location" class="form-input" value="${event.location || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Event Type</label>
                    <select id="event-tag" class="form-input" required>
                        <option value="show" ${event.tag === 'show' ? 'selected' : ''}>Show</option>
                        <option value="custom" ${event.tag === 'custom' ? 'selected' : ''}>Custom Event</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Registration Link (optional)</label>
                    <input type="url" id="event-registration-link" class="form-input" value="${event.registration_link || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Image</label>
                    <div class="drag-drop-area" id="image-drop-area">
                        <p>Drag and drop an image here or click to select</p>
                        <input type="file" id="event-image" accept="image/*" class="hidden">
                    </div>
                </div>
                
                <div class="flex gap-4 pt-4">
                    <button type="submit" class="btn-primary">Update Event</button>
                    <button type="button" class="btn-secondary" onclick="loadEventsSection()">Cancel</button>
                </div>
            </form>
        `;
        
        setupDragAndDrop();
        setupEventForm();
        
    } catch (error) {
        console.error('Error loading event:', error);
        alert('Error loading event: ' + error.message);
    }
}

async function deleteEvent(id) {
    const confirmed = confirm('Are you sure you want to delete this event? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        loadEventsSection();
        
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event: ' + error.message);
    }
}

// Export functions for global access
window.createNewsArticle = createNewsArticle;
window.editNewsArticle = editNewsArticle;
window.deleteNewsArticle = deleteNewsArticle;
window.createMoment = createMoment;
window.editMoment = editMoment;
window.deleteMoment = deleteMoment;
window.createEvent = createEvent;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.createImpact = createImpact;
window.editImpact = editImpact;
window.deleteImpact = deleteImpact;
window.createTeamSection = createTeamSection;
window.editTeamSection = editTeamSection;
window.deleteTeamSection = deleteTeamSection;
window.createTeamMember = createTeamMember;
window.editTeamMember = editTeamMember;
window.deleteTeamMember = deleteTeamMember;
window.deleteMessage = deleteMessage;
window.filterMessages = filterMessages; 