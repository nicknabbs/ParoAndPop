const fs = require('fs');
const path = require('path');

// Load the Etsy data
const etsyProducts = JSON.parse(fs.readFileSync('etsy-products-full.json', 'utf-8'));

console.log(`\n=== Starting Full Product Update ===`);
console.log(`Found ${etsyProducts.length} products in Etsy data\n`);

// Create a mapping of normalized titles to Etsy products
const etsyMap = new Map();
etsyProducts.forEach(product => {
    // Store by normalized title for matching
    const normalized = product.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    etsyMap.set(normalized, product);
    
    // Also store by partial key phrases for better matching
    if (product.title.includes('Christmas Vacation Cat')) {
        etsyMap.set('christmas vacation cat', product);
    }
    if (product.title.includes('F1 Merch')) {
        etsyMap.set('f1 merch box', product);
    }
    // Add more key phrases as needed
});

// Function to find best Etsy match for a product name
function findEtsyMatch(productName) {
    const normalized = productName.toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    
    // Try exact match first
    if (etsyMap.has(normalized)) {
        return etsyMap.get(normalized);
    }
    
    // Try partial matches
    for (const [key, value] of etsyMap) {
        // Check if either contains the other (accounting for truncation)
        if (normalized.includes(key.substring(0, 50)) || 
            key.includes(normalized.substring(0, 50))) {
            return value;
        }
    }
    
    // Try matching by key phrases
    const keyPhrases = [
        'christmas vacation cat',
        'f1 merch',
        'moose mug',
        'christmas light earrings',
        'gnome earrings',
        'halloween',
        'racing',
        'patriotic'
    ];
    
    for (const phrase of keyPhrases) {
        if (normalized.includes(phrase) && etsyMap.has(phrase)) {
            return etsyMap.get(phrase);
        }
    }
    
    return null;
}

// Update all product HTML files
function updateProductHTMLFiles() {
    const productFiles = fs.readdirSync('.')
        .filter(f => f.match(/^product-\d+\.html$/));
    
    console.log(`Found ${productFiles.length} product HTML files to update\n`);
    
    let updated = 0;
    let notFound = [];
    
    productFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Extract product title from the HTML
        const titleMatch = content.match(/<h1>([^<]+)<\/h1>/);
        if (!titleMatch) {
            console.log(`⚠ Could not find title in ${file}`);
            return;
        }
        
        const productTitle = titleMatch[1];
        const etsyProduct = findEtsyMatch(productTitle);
        
        if (!etsyProduct) {
            notFound.push({ file, title: productTitle });
            return;
        }
        
        let updatedContent = content;
        
        // Update price displays
        updatedContent = updatedContent.replace(
            /<div class="product-price">\$[\d.]+<\/div>/g,
            `<div class="product-price">$${etsyProduct.price}</div>`
        );
        
        // Update schema price
        updatedContent = updatedContent.replace(
            /"price": "[\d.]+"/g,
            `"price": "${etsyProduct.price}"`
        );
        
        // Update add to cart button
        updatedContent = updatedContent.replace(
            /addToCart\([^,]+,\s*'[^']+',\s*[\d.]+,/g,
            (match) => {
                const parts = match.split(',');
                parts[2] = ` ${etsyProduct.price}`;
                return parts.join(',');
            }
        );
        
        // Add or update inventory
        if (etsyProduct.quantity > 0) {
            if (updatedContent.includes('product-stock')) {
                updatedContent = updatedContent.replace(
                    /<div class="product-stock">In Stock: \d+<\/div>/g,
                    `<div class="product-stock">In Stock: ${etsyProduct.quantity}</div>`
                );
            } else {
                // Add inventory after price
                updatedContent = updatedContent.replace(
                    /(<div class="product-price">\$[\d.]+<\/div>)/g,
                    `$1\n            <div class="product-stock">In Stock: ${etsyProduct.quantity}</div>`
                );
            }
        }
        
        // Update description
        const etsyDescription = etsyProduct.description
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, ' ');
        
        updatedContent = updatedContent.replace(
            /<div class="product-description">[\s\S]*?<\/div>/,
            `<div class="product-description">
                <p>${etsyDescription}</p>
            </div>`
        );
        
        fs.writeFileSync(file, updatedContent);
        updated++;
        
        console.log(`✓ Updated ${file}: $${etsyProduct.price} (${etsyProduct.quantity} in stock)`);
    });
    
    console.log(`\n✓ Updated ${updated} product files`);
    
    if (notFound.length > 0) {
        console.log(`\n⚠ Could not find Etsy match for ${notFound.length} products:`);
        notFound.forEach(item => {
            console.log(`  - ${item.file}: ${item.title.substring(0, 60)}...`);
        });
    }
}

// Update products.html embedded data
function updateProductsPageData() {
    const productsPagePath = 'products.html';
    let content = fs.readFileSync(productsPagePath, 'utf-8');
    
    // Extract the embedded products data
    const dataMatch = content.match(/const productsData = (\[[\s\S]*?\]);/);
    if (!dataMatch) {
        console.log('⚠ Could not find products data in products.html');
        return;
    }
    
    let productsData = JSON.parse(dataMatch[1]);
    
    // Group products by base name (without IMAGE suffix)
    const productGroups = new Map();
    productsData.forEach(product => {
        const baseName = product.name;
        if (!productGroups.has(baseName)) {
            productGroups.set(baseName, []);
        }
        productGroups.get(baseName).push(product);
    });
    
    // Update prices for each group
    for (const [name, products] of productGroups) {
        const etsyProduct = findEtsyMatch(name);
        if (etsyProduct) {
            products.forEach(p => {
                p.price = etsyProduct.price;
            });
        }
    }
    
    // Replace the data in the HTML
    content = content.replace(
        /const productsData = \[[\s\S]*?\];/,
        `const productsData = ${JSON.stringify(productsData, null, 2)};`
    );
    
    fs.writeFileSync(productsPagePath, content);
    console.log('✓ Updated products.html embedded data');
}

// Update all JSON files with consolidated prices
function updateAllJSONFiles() {
    // Update all-products.json
    if (fs.existsSync('all-products.json')) {
        let allProducts = JSON.parse(fs.readFileSync('all-products.json', 'utf-8'));
        
        // Group by base product name
        const productGroups = new Map();
        allProducts.forEach(product => {
            // Extract base name (remove IMAGE suffix)
            const baseName = product.name;
            if (!productGroups.has(baseName)) {
                productGroups.set(baseName, []);
            }
            productGroups.get(baseName).push(product);
        });
        
        // Update each group with Etsy price
        for (const [name, products] of productGroups) {
            const etsyProduct = findEtsyMatch(name);
            if (etsyProduct) {
                products.forEach(p => {
                    p.price = etsyProduct.price;
                });
            }
        }
        
        fs.writeFileSync('all-products.json', JSON.stringify(allProducts, null, 2));
        console.log('✓ Updated all-products.json');
    }
    
    // Update products-grouped.json if it exists
    if (fs.existsSync('products-grouped.json')) {
        let groupedProducts = JSON.parse(fs.readFileSync('products-grouped.json', 'utf-8'));
        
        groupedProducts.forEach(group => {
            const etsyProduct = findEtsyMatch(group.name);
            if (etsyProduct) {
                group.price = etsyProduct.price;
                if (group.variants) {
                    group.variants.forEach(v => v.price = etsyProduct.price);
                }
            }
        });
        
        fs.writeFileSync('products-grouped.json', JSON.stringify(groupedProducts, null, 2));
        console.log('✓ Updated products-grouped.json');
    }
}

// Create a summary report
function createSummaryReport() {
    const report = {
        timestamp: new Date().toISOString(),
        etsyProductCount: etsyProducts.length,
        updates: {
            htmlFiles: fs.readdirSync('.').filter(f => f.match(/^product-\d+\.html$/)).length,
            jsonFiles: ['all-products.json', 'products-grouped.json', 'products-data.json'].filter(f => fs.existsSync(f)).length
        },
        priceRanges: {
            under20: etsyProducts.filter(p => p.price < 20).length,
            from20to30: etsyProducts.filter(p => p.price >= 20 && p.price < 30).length,
            from30to40: etsyProducts.filter(p => p.price >= 30 && p.price < 40).length,
            over40: etsyProducts.filter(p => p.price >= 40).length
        },
        topProducts: [
            etsyProducts.find(p => p.title.includes('Christmas Vacation Cat')),
            etsyProducts.find(p => p.title.includes('F1 Merch')),
            etsyProducts.find(p => p.title.includes('Moose Mug'))
        ].filter(Boolean).map(p => ({
            title: p.title.substring(0, 60) + '...',
            price: p.price,
            quantity: p.quantity
        }))
    };
    
    fs.writeFileSync('update-report.json', JSON.stringify(report, null, 2));
    return report;
}

// Main execution
updateProductHTMLFiles();
updateProductsPageData();
updateAllJSONFiles();
const report = createSummaryReport();

console.log('\n=== UPDATE COMPLETE ===');
console.log(`Updated products with Etsy prices ranging from $${Math.min(...etsyProducts.map(p => p.price))} to $${Math.max(...etsyProducts.map(p => p.price))}`);
console.log(`Report saved to: update-report.json`);