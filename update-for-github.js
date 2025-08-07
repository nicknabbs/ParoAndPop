const fs = require('fs');
const path = require('path');

// Configuration - Update this with your Supabase URL if you want to use Supabase for images
const USE_SUPABASE = false; // Set to true if you want to use Supabase
const SUPABASE_BUCKET_URL = 'https://your-project.supabase.co/storage/v1/object/public/your-bucket/images/';

// For GitHub Pages, we need to update paths to be relative
const GITHUB_BASE_PATH = '/ParoAndPop'; // Your repository name

function updateFilePaths(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    if (USE_SUPABASE) {
        // Replace local image paths with Supabase URLs
        content = content.replace(/src="\.\/images\//g, `src="${SUPABASE_BUCKET_URL}`);
        content = content.replace(/src="\/images\//g, `src="${SUPABASE_BUCKET_URL}`);
        content = content.replace(/src="images\//g, `src="${SUPABASE_BUCKET_URL}`);
        modified = true;
    } else {
        // For GitHub Pages, ensure paths are relative
        // Update home links to work with GitHub Pages
        content = content.replace(/href="index\.html"/g, 'href="."');
        content = content.replace(/href="\/"/g, 'href="."');
        
        // Keep image paths relative
        content = content.replace(/src="\/images\//g, 'src="./images/');
        
        // Update product links to be relative
        content = content.replace(/href="\/products\//g, 'href="./');
        
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${path.basename(filePath)}`);
    }
}

// Get all HTML files
const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'));

console.log(`Updating ${htmlFiles.length} HTML files for GitHub Pages...`);

htmlFiles.forEach(file => {
    updateFilePaths(file);
});

// Update CSS and JS files if needed
if (fs.existsSync('style.css')) {
    let css = fs.readFileSync('style.css', 'utf8');
    if (USE_SUPABASE) {
        css = css.replace(/url\(['"]?\.\/images\//g, `url('${SUPABASE_BUCKET_URL}`);
        css = css.replace(/url\(['"]?\/images\//g, `url('${SUPABASE_BUCKET_URL}`);
    }
    fs.writeFileSync('style.css', css);
    console.log('Updated: style.css');
}

console.log('\n✅ Files updated for GitHub Pages!');
console.log('Next steps:');
console.log('1. Add your GitHub repository as remote');
console.log('2. Commit and push your changes');
console.log('3. Enable GitHub Pages in repository settings');

if (USE_SUPABASE) {
    console.log('\n⚠️  Remember to upload your images to Supabase storage!');
}