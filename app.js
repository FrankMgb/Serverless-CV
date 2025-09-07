// Portfolio Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initNavigation();
    initSearch();
    initInteractiveElements();
    enhanceAccessibility();
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
        case '#home':
            updateMainContent('Home', getHomeContent());
            break;
        case '#about':
            updateMainContent('About', getAboutContent());
            break;
        case '#skills':
            updateMainContent('Skills', getSkillsContent());
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
function getHomeContent() {
    return `
        <p>Welcome to my portfolio! I'm Nicole Xiomora An, a DevOps & AWS Cloud Engineer based in New Jersey, USA.</p>
        <p>This portfolio showcases my journey in cloud computing, DevOps practices, and software engineering. Browse through different sections to learn more about my skills, experience, and projects.</p>
        <p>Feel free to explore and don't hesitate to reach out for any opportunities or inquiries!</p>
        
        <div style="margin-top: 2rem; padding: 1rem; background: rgba(50, 184, 198, 0.1); border-radius: 8px; border-left: 4px solid var(--color-teal-300);">
            <h3 style="margin-top: 0; color: var(--color-teal-300);">Quick Links</h3>
            <p>• <a href="#about" class="content-link">Learn more about my journey</a></p>
            <p>• <a href="#skills" class="content-link">View my technical skills</a></p>
            <p>• <a href="#experience" class="content-link">See my work experience</a></p>
            <p>• <a href="#archive" class="content-link">Browse my projects</a></p>
        </div>
    `;
}

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
            const categoryName = this.querySelector('.category-name').textContent;
            const categoryCount = this.querySelector('.category-count').textContent;
            
            const categoryContent = `
                <p>Viewing content filtered by <strong>${categoryName}</strong> category (${categoryCount} item${categoryCount !== '1' ? 's' : ''}).</p>
                
                <div style="padding: 1.5rem; background: rgba(50, 184, 198, 0.1); border-radius: 8px; margin: 1.5rem 0;">
                    <h3 style="color: var(--color-teal-300); margin-top: 0;">${categoryName} Content</h3>
                    <p>This section would display all content tagged with the "${categoryName}" category.</p>
                    ${categoryName === 'Projects' ? `
                        <ul>
                            <li>AWS Cloud Resume Challenge Implementation</li>
                            <li>DevOps Pipeline Automation</li>
                            <li>Infrastructure as Code Templates</li>
                            <li>Monitoring and Alerting Systems</li>
                        </ul>
                    ` : categoryName === 'Discussions' ? `
                        <p>Recent discussion: "Best practices for cloud migration strategies"</p>
                    ` : `
                        <p>Professional tips and insights from my experience in DevOps and cloud engineering.</p>
                    `}
                </div>
                
                <p><a href="#about" class="content-link">← Back to main content</a></p>
            `;
            
            updateMainContent(`${categoryName}`, categoryContent);
        });
    });
    
    // Add functionality for tags
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.setAttribute('tabindex', '0');
        tag.setAttribute('role', 'button');
        tag.style.cursor = 'pointer';
        
        tag.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.click();
            }
        });
        
        tag.addEventListener('click', function(event) {
            event.preventDefault();
            const tagName = this.textContent;
            
            const tagContent = `
                <p>Viewing content tagged with <strong>"${tagName}"</strong>.</p>
                
                <div style="padding: 1.5rem; background: rgba(50, 184, 198, 0.1); border-radius: 8px; margin: 1.5rem 0;">
                    <h3 style="color: var(--color-teal-300); margin-top: 0;">${tagName} Related Content</h3>
                    ${getTagSpecificContent(tagName)}
                </div>
                
                <p><a href="#about" class="content-link">← Back to main content</a></p>
            `;
            
            updateMainContent(`Tag: ${tagName}`, tagContent);
        });
    });
    
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