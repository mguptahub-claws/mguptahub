// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuToggle.querySelector('i');
    icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
    });
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Scroll to Top
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#/blog/')) return; // Don't intercept blog links

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Load Projects from JSON
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const projects = await response.json();

        const grid = document.getElementById('projectsGrid');
        grid.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';

            const techTags = project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('');

            let links = '';
            if (project.website) {
                links += `<a href="${project.website}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Website</a>`;
            }
            if (project.github) {
                links += `<a href="${project.github}" target="_blank" class="project-link"><i class="fab fa-github"></i> GitHub</a>`;
            }

            card.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <div class="project-tech">${techTags}</div>
                <div class="project-links">${links}</div>
            `;

            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Load Skills from JSON
async function loadSkills() {
    try {
        const response = await fetch('data/skills.json');
        const skills = await response.json();

        const container = document.getElementById('skillsContainer');
        container.innerHTML = '';

        skills.forEach(skill => {
            const tile = document.createElement('div');
            tile.className = 'skill-tile';
            tile.textContent = skill;
            container.appendChild(tile);
        });
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

// Load Blogs from JSON
async function loadBlogs() {
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();

        const grid = document.getElementById('blogsGrid');
        grid.innerHTML = '';

        blogs.forEach(blog => {
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.onclick = () => window.location.hash = `#/blog/${blog.id}`;

            const tags = blog.tags ? blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('') : '';

            card.innerHTML = `
                <div class="blog-date"><i class="fas fa-calendar"></i> ${new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <h3>${blog.title}</h3>
                <p>${blog.excerpt}</p>
                ${tags ? `<div class="blog-tags">${tags}</div>` : ''}
                <button class="blog-open-new" onclick="event.stopPropagation(); window.open('#/blog/${blog.id}', '_blank');" title="Open in new tab">
                    <i class="fas fa-external-link-alt"></i>
                </button>
            `;

            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading blogs:', error);
    }
}

// Contact Form Handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const statusDiv = document.getElementById('formStatus');

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                statusDiv.className = 'form-status success';
                statusDiv.textContent = 'Message sent successfully!';
                contactForm.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            statusDiv.className = 'form-status error';
            statusDiv.textContent = 'Failed to send message. Please try again.';
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadSkills();
    loadBlogs();
});
