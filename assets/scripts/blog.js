// Blog hash routing
async function handleBlogRoute() {
    const hash = window.location.hash;

    if (hash.startsWith('#/blog/')) {
        const blogId = hash.replace('#/blog/', '');
        await showBlog(blogId);
    } else {
        hideBlog();
    }
}

async function showBlog(blogId) {
    try {
        document.body.classList.add('viewing-blog');
        const viewer = document.getElementById('blogViewer');
        const content = document.getElementById('blogContent');

        viewer.style.display = 'block';
        content.innerHTML = '<p>Loading...</p>';

        // Load blog metadata
        const metaResponse = await fetch('data/blogs.json');
        const blogs = await metaResponse.json();
        const blog = blogs.find(b => b.id === blogId);

        if (!blog) {
            content.innerHTML = '<p>Blog not found.</p>';
            return;
        }

        // Load markdown content
        const mdResponse = await fetch(`blogs/${blog.filename}`);
        const markdown = await mdResponse.text();

        // Update page title
        document.title = `${blog.title} - Manish Gupta`;

        // Render blog
        const html = marked.parse(markdown);
        const bannerHtml = blog.bannerImage ? `
            <div class="blog-banner">
                <img src="${blog.bannerImage}" alt="${blog.title}" />
            </div>
        ` : '';

        content.innerHTML = `
            ${bannerHtml}
            <div class="blog-date"><i class="fas fa-calendar"></i> ${new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            ${blog.tags ? `<div class="blog-tags">${blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}</div>` : ''}
            <div style="margin-top: 1rem;">${html}</div>
        `;

        // Add copy buttons to code blocks
        addCopyButtonsToCodeBlocks();

        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error loading blog:', error);
        document.getElementById('blogContent').innerHTML = '<p>Error loading blog.</p>';
    }
}

// Add copy buttons to all code blocks
function addCopyButtonsToCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.blog-content pre');

    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.className = 'code-copy-btn';
        button.innerHTML = '<i class="fas fa-copy"></i>';
        button.setAttribute('aria-label', 'Copy code');

        button.addEventListener('click', async () => {
            const code = block.querySelector('code');
            const text = code ? code.textContent : block.textContent;

            try {
                await navigator.clipboard.writeText(text);
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.classList.add('copied');

                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                    button.classList.remove('copied');
                }, 3000);
            } catch (err) {
                console.error('Failed to copy:', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                button.innerHTML = '<i class="fas fa-check"></i>';
                button.classList.add('copied');

                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                    button.classList.remove('copied');
                }, 3000);
            }
        });

        block.appendChild(button);
    });
}

function hideBlog() {
    document.body.classList.remove('viewing-blog');
    document.getElementById('blogViewer').style.display = 'none';
    document.title = 'Manish Gupta - Engineering Leader & Entrepreneur';
}

// Listen for hash changes
window.addEventListener('hashchange', handleBlogRoute);
window.addEventListener('DOMContentLoaded', handleBlogRoute);
