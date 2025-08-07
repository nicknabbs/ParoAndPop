#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to update logo/company name with special ampersand
function updateCompanyName(html) {
    // Update logo instances
    html = html.replace(/<a href="\.">Paro & Pop<\/a>/g, 
        '<a href="."><span class="company-name">Paro <span class="ampersand">&</span> Pop</span></a>');
    
    // Update any standalone company names
    html = html.replace(/Paro & Pop(?!<\/)/g, function(match, offset, string) {
        // Check if it's already inside a span or in a title/meta tag
        const beforeText = string.substring(Math.max(0, offset - 50), offset);
        const afterText = string.substring(offset, Math.min(string.length, offset + 50));
        
        if (beforeText.includes('<title>') || beforeText.includes('content="') || 
            beforeText.includes('company-name') || afterText.includes('</title>')) {
            return match; // Don't modify if in title or meta or already styled
        }
        return '<span class="company-name">Paro <span class="ampersand">&</span> Pop</span>';
    });
    
    return html;
}

// Function to add Google Fonts to head if not present
function addGoogleFonts(html) {
    const fontLink = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">';
    
    // Check if Google Fonts already added
    if (html.includes('fonts.googleapis.com')) {
        // Replace old font link with new one
        html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/g, fontLink);
    } else {
        // Add before first stylesheet
        html = html.replace(/<link rel="stylesheet"/, fontLink + '\n    <link rel="stylesheet"');
    }
    
    return html;
}

// Function to update stylesheet reference
function updateStylesheet(html) {
    // First, backup old style.css to style-old.css if not already done
    const oldStylePath = path.join(__dirname, 'style.css');
    const backupPath = path.join(__dirname, 'style-old.css');
    const newStylePath = path.join(__dirname, 'style-new.css');
    
    if (!fs.existsSync(backupPath) && fs.existsSync(oldStylePath)) {
        fs.copyFileSync(oldStylePath, backupPath);
        console.log('Backed up old style.css to style-old.css');
    }
    
    // Copy new style to style.css
    if (fs.existsSync(newStylePath)) {
        fs.copyFileSync(newStylePath, oldStylePath);
        console.log('Updated style.css with new design system');
    }
    
    return html;
}

// Function to add responsive wrapper classes to policy pages
function addResponsiveWrappers(html, filename) {
    // Policy and text-heavy pages
    const policyPages = ['shipping-policy', 'returns-policy', 'faq', 'about', 'contact', 
                        'care-instructions', 'privacy-policy', 'terms-of-service'];
    
    const isPolicyPage = policyPages.some(page => filename.includes(page));
    
    if (isPolicyPage) {
        // Add page-content class to main content area
        if (!html.includes('class="page-content"')) {
            html = html.replace(/<main([^>]*)>/, '<main$1 class="page-content">');
            html = html.replace(/<div class="container">/, '<div class="container page-content">');
        }
        
        // Ensure proper section wrapping
        html = html.replace(/<section class="([^"]*)">/g, function(match, className) {
            if (!className.includes('text-page')) {
                return `<section class="${className} text-page">`;
            }
            return match;
        });
    }
    
    return html;
}

// Function to fix mobile navigation toggle script
function addMobileNavScript(html) {
    const mobileNavScript = `
    <script>
        function toggleMenu() {
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            const nav = document.querySelector('nav');
            
            if (!nav.contains(event.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    </script>`;
    
    // Add script before closing body tag if not present
    if (!html.includes('function toggleMenu()')) {
        html = html.replace('</body>', mobileNavScript + '\n</body>');
    }
    
    return html;
}

// Function to process a single HTML file
function processHTMLFile(filepath) {
    let html = fs.readFileSync(filepath, 'utf-8');
    const filename = path.basename(filepath);
    
    // Apply all updates
    html = addGoogleFonts(html);
    html = updateCompanyName(html);
    html = updateStylesheet(html);
    html = addResponsiveWrappers(html, filename);
    html = addMobileNavScript(html);
    
    // Write updated HTML
    fs.writeFileSync(filepath, html);
    console.log(`Updated: ${filename}`);
}

// Function to recursively find all HTML files
function findHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findHTMLFiles(filepath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filepath);
        }
    });
    
    return fileList;
}

// Main execution
console.log('Starting design overhaul...\n');

// Find all HTML files
const htmlFiles = findHTMLFiles(__dirname);
console.log(`Found ${htmlFiles.length} HTML files to update\n`);

// Process each file
htmlFiles.forEach(file => {
    try {
        processHTMLFile(file);
    } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
    }
});

// Special handling for specific pages
const specialPages = [
    'shipping-policy.html',
    'returns-policy.html',
    'faq.html',
    'about.html',
    'contact.html'
];

console.log('\n=== Applying special fixes to policy pages ===');

specialPages.forEach(pageName => {
    const filepath = path.join(__dirname, pageName);
    if (fs.existsSync(filepath)) {
        let html = fs.readFileSync(filepath, 'utf-8');
        
        // Add specific classes for better spacing
        if (pageName === 'faq.html') {
            // Wrap FAQ items
            html = html.replace(/<h3>/g, '<div class="faq-item">\n        <h3>');
            html = html.replace(/<\/p>\s*(?=<h3>|<h2>|<\/section>)/g, '</p>\n    </div>\n    ');
        }
        
        if (pageName === 'about.html') {
            // Add hero section class
            html = html.replace(/<div class="page-header">/, '<div class="page-header about-hero">');
            html = html.replace(/<section([^>]*)>/, '<section$1 class="about-content">');
        }
        
        if (pageName === 'contact.html') {
            // Add form styling
            html = html.replace(/<form([^>]*)>/, '<form$1 class="contact-form">');
            html = html.replace(/<div>\s*<label/g, '<div class="form-group">\n        <label');
        }
        
        fs.writeFileSync(filepath, html);
        console.log(`Applied special fixes to ${pageName}`);
    }
});

console.log('\n=== Design overhaul complete! ===');
console.log('\nKey changes applied:');
console.log('✅ Added Playfair Display font for headers and company name');
console.log('✅ Added Inter font for body text');
console.log('✅ Updated all company names with special ampersand styling');
console.log('✅ Fixed responsive design for all screen sizes');
console.log('✅ Improved spacing and readability on policy pages');
console.log('✅ Enhanced mobile navigation');
console.log('✅ Added proper container classes and padding');
console.log('\nThe website now has an elegant, professional design with proper "Paro & Pop" branding!');