#!/usr/bin/env node

/**
 * Blog Banner Image Generator
 *
 * This script fetches relevant images from Unsplash API and downloads them
 * for blog post banners.
 *
 * Usage:
 * 1. Set environment variables:
 *    export UNSPLASH_ACCESS_KEY="your_access_key"
 *    export UNSPLASH_SECRET_KEY="your_secret_key"
 *
 * 2. Run the script:
 *    node generate-blog-banners.js
 *
 * The script will:
 * - Read blogs from data/blogs.json
 * - Search Unsplash for relevant images based on blog tags
 * - Download images to assets/images/blog-banners/
 * - Update blogs.json with banner image paths
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Check for required environment variables
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const SECRET_KEY = process.env.UNSPLASH_SECRET_KEY;

if (!ACCESS_KEY) {
    console.error('Error: UNSPLASH_ACCESS_KEY environment variable not set');
    console.error('Usage: export UNSPLASH_ACCESS_KEY="your_key"');
    process.exit(1);
}

// Ensure output directory exists
const BANNER_DIR = path.join(__dirname, 'assets', 'images', 'blog-banners');
if (!fs.existsSync(BANNER_DIR)) {
    fs.mkdirSync(BANNER_DIR, { recursive: true });
    console.log(`Created directory: ${BANNER_DIR}`);
}

// Read blogs.json
const blogsPath = path.join(__dirname, 'data', 'blogs.json');
const blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf8'));

console.log(`Found ${blogs.length} blogs to process\n`);

/**
 * Search Unsplash for an image based on query
 */
function searchUnsplash(query) {
    return new Promise((resolve, reject) => {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

        const options = {
            headers: {
                'Authorization': `Client-ID ${ACCESS_KEY}`
            }
        };

        https.get(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.results && result.results.length > 0) {
                        resolve(result.results[0]);
                    } else {
                        reject(new Error('No images found'));
                    }
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Download an image from URL
 */
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);

        https.get(url, (response) => {
            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve();
            });

            file.on('error', (err) => {
                fs.unlink(filepath, () => {});
                reject(err);
            });
        }).on('error', reject);
    });
}

/**
 * Process a single blog
 */
async function processBlog(blog) {
    console.log(`Processing: ${blog.title}`);

    // Generate search query from tags or title
    const searchQuery = blog.tags ? blog.tags.join(' ') : blog.title;
    console.log(`  Search query: ${searchQuery}`);

    try {
        // Search for image
        const image = await searchUnsplash(searchQuery);
        console.log(`  Found image by: ${image.user.name}`);

        // Download image (using 'regular' size - good for banners)
        const imageUrl = image.urls.regular;
        const filename = `${blog.id}.jpg`;
        const filepath = path.join(BANNER_DIR, filename);

        console.log(`  Downloading to: ${filename}`);
        await downloadImage(imageUrl, filepath);

        // Update blog object
        blog.bannerImage = `assets/images/blog-banners/${filename}`;
        blog.bannerCredit = {
            photographerName: image.user.name,
            photographerUrl: image.user.links.html,
            unsplashUrl: image.links.html
        };

        console.log(`  ✓ Success!\n`);
        return true;

    } catch (error) {
        console.error(`  ✗ Error: ${error.message}\n`);
        return false;
    }
}

/**
 * Main function
 */
async function main() {
    console.log('Starting blog banner generation...\n');

    let successCount = 0;
    let failCount = 0;

    for (const blog of blogs) {
        const success = await processBlog(blog);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }

        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Write updated blogs.json
    fs.writeFileSync(blogsPath, JSON.stringify(blogs, null, 2));
    console.log('Updated blogs.json with banner image paths');

    console.log('\n=== Summary ===');
    console.log(`✓ Success: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`\nBanner images saved to: ${BANNER_DIR}`);
}

// Run the script
main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
