const fs = require('fs');
const path = require('path');

// Load the Etsy data
const etsyProducts = JSON.parse(fs.readFileSync('etsy-products-full.json', 'utf-8'));

// Find Christmas Vacation Cat Earrings in Etsy data
const christmasVacationCat = etsyProducts.find(p => 
    p.title.includes('Christmas Vacation Cat Earrings') && 
    p.title.includes('Holiday Light Wrapped Cat')
);

console.log('Found Christmas Vacation Cat product:', christmasVacationCat ? 'YES' : 'NO');
if (christmasVacationCat) {
    console.log('  Price: $' + christmasVacationCat.price);
    console.log('  Quantity:', christmasVacationCat.quantity);
}

// Update homepage to feature the Christmas Vacation Cat earrings
function updateHomepage() {
    const homepagePath = 'index.html';
    let homepage = fs.readFileSync(homepagePath, 'utf-8');
    
    // Update the hero section with Product 90 (Christmas Vacation Cat)
    homepage = homepage.replace(
        /onclick="addToCart\('110'[^)]+\)/g,
        `onclick="addToCart('90', 'Christmas Vacation Cat Earrings - Holiday Light Wrapped Cat', ${christmasVacationCat.price}, './images/90_Christmas Vacation Cat Earrings - Holiday Light Wrapped Cat - FREE SHIPPING- Funny Christmas Jewelry - Unique Gift_IMAGE1.jpg')"`
    );
    
    // Update the price display
    homepage = homepage.replace(
        /<div class="hero-price">\$\d+(?:\.\d+)?<\/div>/g,
        `<div class="hero-price">$${christmasVacationCat.price}</div>`
    );
    
    // Update the hero image
    homepage = homepage.replace(
        /src="\.\/images\/110[^"]+"/g,
        'src="./images/90_Christmas Vacation Cat Earrings - Holiday Light Wrapped Cat - FREE SHIPPING- Funny Christmas Jewelry - Unique Gift_IMAGE1.jpg"'
    );
    
    // Update alt text
    homepage = homepage.replace(
        /alt="[^"]*9 Lives[^"]*"/g,
        'alt="Christmas Vacation Cat Earrings - Holiday Light Wrapped Cat"'
    );
    
    // Update inventory if shown
    if (christmasVacationCat.quantity > 0) {
        homepage = homepage.replace(
            /Only \d+ left in stock!/g,
            `Only ${christmasVacationCat.quantity} left in stock!`
        );
    }
    
    fs.writeFileSync(homepagePath, homepage);
    console.log('✓ Updated homepage with Christmas Vacation Cat as featured product');
}

// Update shipping message across all HTML files
function updateShippingMessage() {
    const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
    let updatedCount = 0;
    
    htmlFiles.forEach(file => {
        let content = fs.readFileSync(file, 'utf-8');
        const originalContent = content;
        
        // Replace the conditional shipping message with simple FREE SHIPPING
        content = content.replace(
            /<span class="sale-text">FREE SHIPPING on Orders Over \$50! Ends in: <span id="countdown">[^<]+<\/span><\/span>/g,
            '<span class="sale-text">✨ FREE SHIPPING ✨</span>'
        );
        
        // Also remove any countdown timer scripts related to this
        content = content.replace(
            /\/\/ Countdown timer[\s\S]*?setInterval\(updateCountdown, 1000\);/g,
            ''
        );
        
        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            updatedCount++;
        }
    });
    
    console.log(`✓ Updated shipping message in ${updatedCount} HTML files`);
}

// Update product 90 HTML file specifically
function updateProduct90Page() {
    const product90Path = 'product-90.html';
    if (!fs.existsSync(product90Path)) {
        console.log('⚠ Product 90 HTML file not found');
        return;
    }
    
    let content = fs.readFileSync(product90Path, 'utf-8');
    
    // Update price
    content = content.replace(
        /<div class="product-price">\$[\d.]+<\/div>/g,
        `<div class="product-price">$${christmasVacationCat.price}</div>`
    );
    
    // Update schema price
    content = content.replace(
        /"price": "[\d.]+"/g,
        `"price": "${christmasVacationCat.price}"`
    );
    
    // Update inventory if present
    if (christmasVacationCat.quantity > 0) {
        // Check if there's an inventory display and update it
        content = content.replace(
            /In Stock: \d+/g,
            `In Stock: ${christmasVacationCat.quantity}`
        );
        
        // Add inventory display if not present
        if (!content.includes('In Stock:')) {
            content = content.replace(
                /<div class="product-price">\$[\d.]+<\/div>/,
                `<div class="product-price">$${christmasVacationCat.price}</div>
            <div class="product-stock">In Stock: ${christmasVacationCat.quantity}</div>`
            );
        }
    }
    
    // Update description to match Etsy
    const etsyDescription = christmasVacationCat.description.replace(/\n/g, '</p><p>');
    content = content.replace(
        /<div class="product-description">[\s\S]*?<\/div>/,
        `<div class="product-description">
                <p>${etsyDescription}</p>
            </div>`
    );
    
    fs.writeFileSync(product90Path, content);
    console.log('✓ Updated product-90.html with correct price and data');
}

// Update all JSON data files
function updateJSONFiles() {
    // Update all-products.json
    if (fs.existsSync('all-products.json')) {
        let allProducts = JSON.parse(fs.readFileSync('all-products.json', 'utf-8'));
        
        // Create a map of Etsy products by title for quick lookup
        const etsyMap = new Map();
        etsyProducts.forEach(ep => {
            const normalizedTitle = ep.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
            etsyMap.set(normalizedTitle, ep);
        });
        
        // Update prices for all products
        allProducts = allProducts.map(product => {
            const productTitle = product.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
            
            // Special handling for Christmas Vacation Cat
            if (product.id.includes('90_Christmas Vacation Cat')) {
                product.price = christmasVacationCat.price;
            } else {
                // Try to find matching Etsy product
                for (const [etsyTitle, etsyProduct] of etsyMap) {
                    if (productTitle.includes(etsyTitle) || etsyTitle.includes(productTitle)) {
                        product.price = etsyProduct.price;
                        break;
                    }
                }
            }
            
            return product;
        });
        
        fs.writeFileSync('all-products.json', JSON.stringify(allProducts, null, 2));
        console.log('✓ Updated all-products.json with Etsy prices');
    }
    
    // Update products-data.json
    if (fs.existsSync('products-data.json')) {
        let productsData = JSON.parse(fs.readFileSync('products-data.json', 'utf-8'));
        
        // Similar price update logic
        productsData = productsData.map(product => {
            if (product.id === 90 || product.name?.includes('Christmas Vacation Cat')) {
                product.price = christmasVacationCat.price;
                product.inventory = christmasVacationCat.quantity;
            }
            return product;
        });
        
        fs.writeFileSync('products-data.json', JSON.stringify(productsData, null, 2));
        console.log('✓ Updated products-data.json');
    }
}

// Main execution
console.log('\n=== Starting Website Updates ===\n');

updateHomepage();
updateShippingMessage();
updateProduct90Page();
updateJSONFiles();

console.log('\n=== Update Complete ===');
console.log('Christmas Vacation Cat Earrings is now featured!');
console.log('Price: $' + christmasVacationCat.price);
console.log('Inventory: ' + christmasVacationCat.quantity + ' units');