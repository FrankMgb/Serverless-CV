// Portfolio Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initNavigation();
    initSearch();
    initInteractiveElements();
    enhanceAccessibility();
    initVisitorCounter();
    initProjects();
    initSectionSwitcher();
});

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Toggle mobile menu visibility
            mobileMenu.classList.toggle('hidden');
            mobileMenuToggle.classList.toggle('active');
            
            // Toggle aria-expanded for accessibility
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Close mobile menu when clicking on a nav link
        const mobileNavLinks = mobileMenu.querySelectorAll('.nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close mobile menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/**
 * Visitor Counter
 */
function initVisitorCounter() {
    const countEl = document.getElementById('visitor-count');
    if (!countEl) return;

    // Allow configuration via global window.CONFIG.API_URL injected in index.html
    const apiUrl = (window.CONFIG && window.CONFIG.API_URL) || null;
    if (!apiUrl) {
        // No API configured yet; keep placeholder and exit gracefully
        countEl.textContent = '—';
        countEl.title = 'Visitor counter inactive (no API URL configured)';
        return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        signal: controller.signal
    }).then(async (res) => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Support both {count: number} and plain number responses
        const data = await res.json().catch(() => null);
        let value = null;
        if (data === null) {
            // Attempt text fallback
            const text = await res.text().catch(() => '');
            const num = Number(text);
            if (!Number.isNaN(num)) value = num;
        } else if (typeof data === 'number') {
            value = data;
        } else if (data && typeof data.count !== 'undefined') {
            value = Number(data.count);
        }
        if (value === null || Number.isNaN(value)) throw new Error('Invalid response');
        countEl.textContent = value.toLocaleString();
        countEl.setAttribute('data-loaded', 'true');
    }).catch((err) => {
        clearTimeout(timeout);
        // Fail quietly: leave placeholder and add tooltip for debugging
        countEl.textContent = '—';
        countEl.title = `Visitor counter unavailable (${err && err.message ? err.message : 'error'})`;
    });
}

/**
 * Projects list population
 */
function initProjects() {
    // Support multiple projects hubs (e.g., in About and in #projects-section)
    const sections = Array.from(document.querySelectorAll('.projects-section'));
    if (!sections.length) return;

    sections.forEach((section) => {
        const list = section.querySelector('.project-list');
        if (!list) return;

    const cfg = (window.CONFIG && Array.isArray(window.CONFIG.projects)) ? window.CONFIG.projects : null;
    const staticItems = Array.from(list.querySelectorAll('li a.project-link')).map(a => ({
        title: a.querySelector('.project-title')?.textContent?.trim() || a.textContent.trim(),
        href: a.getAttribute('href') || '#',
        date: a.querySelector('.project-date')?.textContent?.trim() || '',
        tags: (a.querySelector('.project-tags')?.textContent || '').split(/\s+/).filter(Boolean)
    }));

    const source = (cfg && cfg.length) ? cfg : staticItems;

    // Build category pills from tags (fallback to a single "All")
    const allTags = new Set();
    source.forEach(p => {
        const tags = Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(/\s+/);
        tags.filter(Boolean).forEach(t => allTags.add(t.replace(/^#/, '')));
    });
    const categories = ['All', ...Array.from(allTags).slice(0, 12)];

    // Inject category bar if not present
    let catBar = section.querySelector('.project-categories');
    if (!catBar) {
        catBar = document.createElement('div');
        catBar.className = 'project-categories';
        // If list is not a direct child of section, insert before list within its parent to avoid NotFoundError
        const parent = list.parentNode;
        if (parent === section) {
            section.insertBefore(catBar, list);
        } else if (parent && parent.insertBefore) {
            parent.insertBefore(catBar, list);
        } else {
            section.prepend(catBar);
        }
    }
    catBar.innerHTML = categories.map((c, i) => `<button class="project-cat${i===0?' active':''}" data-cat="${c}">${c}</button>`).join('');

    // Detail container
    // Create a detail container scoped to this section to avoid ID clashes
    let detail = section.querySelector('.project-detail-inline');
    if (!detail) {
        detail = document.createElement('div');
        detail.className = 'project-detail-container project-detail-inline hidden';
        section.appendChild(detail);
    }

    // Render list by category
    const escape = (s) => String(s==null?'':s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

    function renderList(activeCat='All') {
        const items = source.filter(p => {
            if (activeCat === 'All') return true;
            const tags = Array.isArray(p.tags) ? p.tags : String(p.tags||'').split(/\s+/);
            return tags.some(t => t.replace(/^#/, '') === activeCat);
        });
        list.innerHTML = items.map(p => {
            const tags = Array.isArray(p.tags) ? p.tags.join(' ') : (p.tags||'');
            const ext = String(p.href||p.url||'#');
            const target = (/^https?:\/\//.test(ext)) ? ' target="_blank" rel="noopener noreferrer"' : '';
            return `<li>
              <a href="${escape(ext)}" class="project-link" data-title="${escape(p.title)}" data-href="${escape(ext)}" data-tags="${escape(tags)}" data-date="${escape(p.date||'')}">
                <span class="project-title">${escape(p.title)}</span>
                <span class="project-date">${escape(p.date||'')}</span>
                <span class="project-tags">${escape(tags)}</span>
              </a>
            </li>`;
        }).join('');
        attachItemHandlers();
    }

    function attachItemHandlers() {
        list.querySelectorAll('a.project-link').forEach(a => {
            a.addEventListener('click', function(e){
                const href = this.getAttribute('href') || '#';
                if (href.startsWith('#')) {
                    // In-page anchor: reveal existing section
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        // Show inline detail wrapper pointing to existing content
                        detail.classList.remove('hidden');
                        detail.innerHTML = '';
                        detail.appendChild(target.cloneNode(true));
                        detail.scrollIntoView({behavior:'smooth', block:'start'});
                    }
                    return;
                }
                // For our inline details, intercept internal relative links
                if (!/^https?:\/\//.test(href)) {
                    e.preventDefault();
                    const title = this.dataset.title || 'Project';
                    const date = this.dataset.date || '';
                    const tags = this.dataset.tags || '';
                    detail.classList.remove('hidden');
                    detail.innerHTML = `
                        <h1>${escape(title)}</h1>
                        ${date?`<p style="color: var(--color-text-secondary); margin-bottom: 8px;">${escape(date)}</p>`:''}
                        ${tags?`<p class="project-tags">${escape(tags)}</p>`:''}
                        <p>Details coming soon. If this project has its own page, it would open at: <code>${escape(href)}</code>.</p>
                    `;
                    detail.scrollIntoView({behavior:'smooth', block:'start'});
                }
            });
        });
    }

    // Category switching
    catBar.querySelectorAll('.project-cat').forEach(btn => {
        btn.addEventListener('click', function(){
            catBar.querySelectorAll('.project-cat').forEach(b=>b.classList.remove('active'));
            this.classList.add('active');
            const cat = this.getAttribute('data-cat');
            renderList(cat);
            // hide detail on category change
            detail.classList.add('hidden');
            detail.innerHTML = '';
        });
    });

    // Initial render
    renderList('All');
    }); // end sections.forEach
}

/**
 * Navigation Functionality
 */
function initNavigation() {
    // Handle all navigation links (both desktop and mobile)
    const allNavLinks = document.querySelectorAll('.nav-link');
    
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            
            // Handle internal navigation (starts with #)
            if (href && href.startsWith('#')) {
                event.preventDefault();
                event.stopPropagation();
                
                // Remove active class from all nav links
                allNavLinks.forEach(navLink => navLink.classList.remove('active'));
                
                // Add active class to all matching links (desktop and mobile)
                const matchingLinks = document.querySelectorAll(`a[href="${href}"]`);
                matchingLinks.forEach(matchingLink => matchingLink.classList.add('active'));
                
                // Handle specific section navigation
                handleSectionNavigation(href);
                
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
            }
            // For external links (like GitHub), let them work normally
        });
    });
}

/**
 * Handle navigation to different sections
 */
function handleSectionNavigation(href) {
    // Update content based on navigation
    switch (href) {
        case '#about':
            updateMainContent('About', getAboutContent());
            break;
        case '#experience':
            updateMainContent('Experience', getExperienceContent());
            break;
        case '#archive':
            updateMainContent('Archive', getArchiveContent());
            break;
        case '#github':
            // For GitHub, open in new tab
            window.open('https://github.com', '_blank');
            return;
        default:
            // Default to about content
            updateMainContent('About', getAboutContent());
            break;
    }
}

/**
 * Update main content area
 */
function updateMainContent(title, content) {
    const contentHeader = document.querySelector('.content-header h1');
    const contentBody = document.querySelector('.content-body');
    
    if (contentHeader && contentBody) {
        // Smooth transition effect
        contentBody.style.opacity = '0.5';
        
        setTimeout(() => {
            contentHeader.textContent = title;
            contentBody.innerHTML = content;
            contentBody.style.opacity = '1';
            
            // Scroll to top of main content smoothly
            document.querySelector('.main-content').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 150);
    }
}

/**
 * Content for different sections
 */

function getAboutContent() {
    return `
        <p>Hello everybody, I'm Nicole! Welcome to my cloud portfolio.</p>
        
        <p>In short, I got started in engineering in high school. At the time I wanted to become a orchestral musician and I did everything under the sun relating to music. When a Girls Who Code program started, I wanted to join, but I was met with opposition.</p>
        
        <blockquote class="quote">
            "You don't have time, you can't learn programming"
        </blockquote>
        
        <p>And I stayed there and argued with the program teacher saying that I will make time.</p>
        
        <p>Surprisingly, I ended up finishing the entire program within 3 months. Both the Robotics and Girls Who Code teachers saw how passionate I was about solving problems and how much I loved programming. I was the Lead Programmer for our First Robotics Competition Team 2070. As I was doing the electrical work alongside programming in Java, I wanted to pivot to Computer Engineering.</p>
        
        <p>To this day I appreciate them both for giving me so many opportunities and encouraging me to pursue engineering. I started in engineering because I wanted to prove that I could do it and I stayed because I loved coming up with creative solutions.</p>
        
        <p>Throughout my college career, I worked simultaneously as a DevOps Engineer for SPHERE Technology Solutions. I learned so much, not just how to develop code, but how to manage, build, package, and ship it. I had so many amazing mentors and team members there and it was amazing to learn from them.</p>
        
        <p>Right before I graduated I gained exposure to <a href="https://aws.amazon.com" class="content-link" target="_blank">Amazon Web Services (AWS)</a> and I really loved cloud computing. There are so many benefits, resources, and tools to basically create anything you want. Following my graduation, I studied and built projects to support my AWS learning, and I got my first certification: AWS Cloud Practitioner!</p>
        
        <p>This portfolio was built as my version of the <a href="https://cloudresumechallenge.dev" class="content-link" target="_blank">AWS Cloud Resume Challenge by Forrest Brazeal</a>, please enjoy and don't hesitate to contact me for any opportunities or inquiries.</p>
    `;
}

function getSkillsContent() {
    return `
        <p>Here are some of the key technologies and skills I work with:</p>
        
        <div style="display: grid; gap: 1.5rem; margin-top: 2rem;">
            <div style="padding: 1rem; background: rgba(50, 184, 198, 0.1); border-radius: 8px;">
                <h3 style="color: var(--color-teal-300); margin-top: 0;">☁️ Cloud Platforms</h3>
                <p>Amazon Web Services (AWS) - Certified Cloud Practitioner with hands-on experience in various AWS services including EC2, S3, Lambda, CloudFormation, and more.</p>
            </div>
            
            <div style="padding: 1rem; background: rgba(94, 82, 64, 0.15); border-radius: 8px;">
                <h3 style="color: var(--color-teal-300); margin-top: 0;">🔧 DevOps & Infrastructure</h3>
                <p>Experience with containerization (Docker), orchestration, CI/CD pipelines, infrastructure as code, and automated deployment strategies.</p>
            </div>
            
            <div style="padding: 1rem; background: rgba(119, 124, 124, 0.15); border-radius: 8px;">
                <h3 style="color: var(--color-teal-300); margin-top: 0;">💻 Programming Languages</h3>
                <p>Java, Python, JavaScript, and shell scripting for automation and application development.</p>
            </div>
            
            <div style="padding: 1rem; background: rgba(50, 184, 198, 0.1); border-radius: 8px;">
                <h3 style="color: var(--color-teal-300); margin-top: 0;">🛠️ Development Tools</h3>
                <p>Version control with Git, build automation, testing frameworks, and monitoring tools.</p>
            </div>
        </div>
    `;
}

function getExperienceContent() {
    return `
        <div style="display: flex; flex-direction: column; gap: 2rem;">
            <div style="padding: 1.5rem; background: rgba(50, 184, 198, 0.1); border-radius: 8px; border-left: 4px solid var(--color-teal-300);">
                <h3 style="color: var(--color-teal-300); margin-top: 0;">DevOps Engineer - SPHERE Technology Solutions</h3>
                <p style="color: rgba(var(--color-gray-300-rgb), 0.8); margin-bottom: 1rem;">Throughout College Career</p>
                <p>Throughout my college career, I worked as a DevOps Engineer where I gained extensive experience in:</p>
                <ul style="margin-left: 1rem;">
                    <li>Code development, management, and deployment</li>
                    <li>Build automation and packaging</li>
                    <li>Infrastructure management and optimization</li>
                    <li>Collaboration with cross-functional teams</li>
                </ul>
            </div>
            
            <div style="padding: 1.5rem; background: rgba(94, 82, 64, 0.15); border-radius: 8px; border-left: 4px solid var(--color-orange-400);">
                <h3 style="color: var(--color-orange-400); margin-top: 0;">Lead Programmer - First Robotics Competition Team 2070</h3>
                <p style="color: rgba(var(--color-gray-300-rgb), 0.8); margin-bottom: 1rem;">High School</p>
                <p>Led programming efforts for our competitive robotics team, combining electrical work with Java programming to create innovative solutions for complex challenges.</p>
            </div>
            
            <div style="padding: 1.5rem; background: rgba(119, 124, 124, 0.15); border-radius: 8px; border-left: 4px solid var(--color-gray-300);">
                <h3 style="color: var(--color-gray-300); margin-top: 0;">Education & Certifications</h3>
                <p>Computer Engineering background with AWS Cloud Practitioner certification, demonstrating commitment to continuous learning in cloud technologies.</p>
            </div>
        </div>
    `;
}

function getArchiveContent() {
    return `
        <p>Welcome to my project archive! Here you'll find a collection of my work and contributions.</p>
        
        <div style="display: grid; gap: 1.5rem; margin-top: 2rem;">
            <div style="padding: 1.5rem; background: rgba(50, 184, 198, 0.1); border-radius: 8px;">
                <h3 style="color: var(--color-teal-300); margin-top: 0;">📁 Featured Projects</h3>
                <p>This portfolio website serves as my implementation of the AWS Cloud Resume Challenge, showcasing both front-end development skills and cloud infrastructure knowledge.</p>
                <div style="margin-top: 1rem;">
                    <span style="background: rgba(50, 184, 198, 0.2); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-right: 0.5rem;">Cloud Resume Challenge</span>
                    <span style="background: rgba(50, 184, 198, 0.2); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-right: 0.5rem;">AWS</span>
                    <span style="background: rgba(50, 184, 198, 0.2); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">JavaScript</span>
                </div>
            </div>
            
            <div style="padding: 1.5rem; background: rgba(94, 82, 64, 0.15); border-radius: 8px;">
                <h3 style="color: var(--color-orange-400); margin-top: 0;">🎓 Learning Journey</h3>
                <p>From my early days in the Girls Who Code program to becoming an AWS Certified Cloud Practitioner, each project represents a milestone in my continuous learning journey.</p>
                <div style="margin-top: 1rem;">
                    <span style="background: rgba(230, 129, 97, 0.2); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-right: 0.5rem;">Girls Who Code</span>
                    <span style="background: rgba(230, 129, 97, 0.2); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-right: 0.5rem;">Robotics</span>
                    <span style="background: rgba(230, 129, 97, 0.2); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">Certification</span>
                </div>
            </div>
        </div>
        
        <p style="margin-top: 2rem;">Check back regularly as I continue to add new projects and expand my technical expertise!</p>
    `;
}

/**
 * Search functionality
 */
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchIcon = document.querySelector('.search-icon');
    
    if (searchInput) {
        // Prevent search input from triggering navigation
        searchInput.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            this.focus();
        });
        
        searchInput.addEventListener('input', function(event) {
            const searchTerm = event.target.value.toLowerCase();
            
            // In a real application, this would perform actual search
            if (searchTerm.length > 2) {
                console.log('Searching for:', searchTerm);
                // Placeholder for search functionality
            }
        });
        
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const searchTerm = event.target.value.trim();
                if (searchTerm) {
                    performSearch(searchTerm);
                }
            }
        });
    }
    
    if (searchIcon) {
        searchIcon.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (searchInput) {
                searchInput.focus();
            }
        });
    }
}

/**
 * Perform search (placeholder implementation)
 */
function performSearch(searchTerm) {
    console.log('Performing search for:', searchTerm);
    
    // Create a simple search results display
    const searchResults = `
        <p>Search results for: "<strong>${searchTerm}</strong>"</p>
        <div style="padding: 1rem; background: rgba(50, 184, 198, 0.1); border-radius: 8px; margin: 1rem 0;">
            <p>In a full implementation, this would search through:</p>
            <ul>
                <li>Portfolio content and descriptions</li>
                <li>Skills and technologies</li>
                <li>Project details and tags</li>
                <li>Experience and background information</li>
            </ul>
        </div>
        <p>This is a demo search implementation. The actual search functionality would integrate with a backend service or search index.</p>
    `;
    
    updateMainContent(`Search Results`, searchResults);
}

/**
 * Initialize interactive elements
 */
function initInteractiveElements() {
    // Add functionality for category items
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.style.cursor = 'pointer';
        
        item.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.click();
            }
        });
        
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const categoryName = this.querySelector('.category-name')?.textContent?.trim() || '';
            // If user clicks Projects category, jump to Projects hub and show the list with filters
            if (/^project/i.test(categoryName)) {
                const projectsSection = document.querySelector('.projects-section');
                if (projectsSection) {
                    projectsSection.scrollIntoView({behavior:'smooth', block:'start'});
                    // If a category bar exists, default to All
                    const firstPill = projectsSection.querySelector('.project-categories .project-cat');
                    if (firstPill) firstPill.click();
                }
                return;
            }
            // Default fallback copy (non-project categories)
            const categoryCount = this.querySelector('.category-count')?.textContent || '0';
            const categoryContent = `
                <p>Viewing content filtered by <strong>${categoryName}</strong> category (${categoryCount} item${categoryCount !== '1' ? 's' : ''}).</p>
                <div style="padding: 1.5rem; background: rgba(50, 184, 198, 0.1); border-radius: 8px; margin: 1.5rem 0;">
                    <h3 style="color: var(--color-teal-300); margin-top: 0;">${categoryName} Content</h3>
                    <p>This section would display all content tagged with the "${categoryName}" category.</p>
                </div>`;
            updateMainContent(`${categoryName}`, categoryContent);
        });
    });
    
    // Add functionality for skills tabs in sidebar
    const skillsTabs = document.querySelectorAll('.skills-tab');
    const skillsPanels = document.querySelectorAll('.skills-panel');
    if (skillsTabs.length && skillsPanels.length) {
        skillsTabs.forEach(tab => {
            tab.setAttribute('tabindex', '0');
            tab.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.click();
                }
            });
            tab.addEventListener('click', function() {
                // Update active tab
                skillsTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                // Show corresponding panel
                const targetId = this.getAttribute('aria-controls');
                skillsPanels.forEach(panel => {
                    if (panel.id === targetId) {
                        panel.classList.remove('hidden');
                    } else {
                        panel.classList.add('hidden');
                    }
                });
            });
        });
    }
    
    // Enhance social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px) scale(1)';
        });
        
        // Add click tracking
        link.addEventListener('click', function() {
            const platform = this.getAttribute('aria-label') || 'Social Media';
            console.log(`${platform} link clicked`);
        });
    });
}

/**
 * Get content specific to a tag
 */
function getTagSpecificContent(tagName) {
    const tagContentMap = {
        'AWS': '<p>My AWS journey includes certification as a Cloud Practitioner and hands-on experience with various AWS services in both personal and professional projects.</p>',
        'AI': '<p>Exploring artificial intelligence applications in cloud computing and DevOps automation.</p>',
        'Books': '<p>Technical books and resources that have shaped my understanding of cloud computing and software engineering.</p>',
        'Business': '<p>Understanding the business value of cloud technologies and how technical decisions impact organizational goals.</p>',
        'Certification': '<p>AWS Cloud Practitioner certification and ongoing learning towards additional cloud certifications.</p>',
        'Cloud Resume Challenge': '<p>This portfolio is my implementation of the Cloud Resume Challenge, demonstrating full-stack development with cloud infrastructure.</p>',
        'Project': '<p>Various technical projects showcasing skills in cloud computing, DevOps, and software development.</p>',
        'Review': '<p>Technical reviews and assessments of tools, technologies, and best practices in the field.</p>'
    };
    
    return tagContentMap[tagName] || '<p>Content related to this topic will be added soon.</p>';
}

/**
 * Simple About/Projects tabs switcher
 */
function initSectionSwitcher() {
    const contentBody = document.querySelector('.content-body');
    if (!contentBody) return;

    let aboutPane = document.getElementById('about-section');
    let projectsPane = document.getElementById('projects-section');

    if (!aboutPane || !projectsPane) {
        const all = Array.from(contentBody.childNodes);
        const projIndex = all.findIndex(n => n.nodeType === 1 && n.classList && n.classList.contains('projects-section'));
        if (projIndex !== -1) {
            if (!aboutPane) {
                aboutPane = document.createElement('section');
                aboutPane.id = 'about-section';
                aboutPane.className = 'section-pane';
                for (let i = 0; i < projIndex; i++) {
                    if (all[i]) aboutPane.appendChild(all[i].cloneNode(true));
                }
            }
            if (!projectsPane) {
                projectsPane = document.createElement('section');
                projectsPane.id = 'projects-section';
                projectsPane.className = 'section-pane';
                for (let i = projIndex; i < all.length; i++) {
                    if (all[i]) projectsPane.appendChild(all[i].cloneNode(true));
                }
            }
            contentBody.innerHTML = '';
            contentBody.appendChild(aboutPane);
            contentBody.appendChild(projectsPane);
        } else {
            return;
        }
    } else {
        aboutPane.classList.add('section-pane');
        projectsPane.classList.add('section-pane');
    }

    aboutPane.hidden = false;
    projectsPane.hidden = true;
    aboutPane.style.opacity = '1';
    projectsPane.style.opacity = '0';

    const tabs = document.querySelectorAll('.top-tab');
    if (tabs.length) {
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSel = tab.getAttribute('data-target');
                const toShow = targetSel ? document.querySelector(targetSel) : null;
                if (!toShow) return;
                const toHide = (toShow === aboutPane) ? projectsPane : aboutPane;

                tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                toHide.style.opacity = '0';
                setTimeout(() => {
                    toHide.hidden = true;
                    toShow.hidden = false;
                    requestAnimationFrame(() => { toShow.style.opacity = '1'; });
                }, 150);

                if (toShow === projectsPane) {
                    const projSection = toShow.querySelector('.projects-section');
                    if (projSection) projSection.scrollIntoView({behavior:'smooth', block:'start'});
                }
            });
        });
    }
}

/**
 * Handle window resize for responsive behavior
 */
window.addEventListener('resize', function() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    
    // Hide mobile menu on desktop view
    if (window.innerWidth > 768) {
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    }
});

/**
 * Accessibility enhancements
 */
function enhanceAccessibility() {
    // Add proper ARIA labels
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
    
    // Add focus management for search
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.setAttribute('aria-label', 'Search portfolio content');
    }
    
    // Add smooth transitions for content changes
    const contentBody = document.querySelector('.content-body');
    if (contentBody) {
        contentBody.style.transition = 'opacity 150ms ease-in-out';
    }
}