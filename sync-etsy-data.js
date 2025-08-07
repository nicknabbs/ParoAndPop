const fs = require('fs');
const path = require('path');

// Parse Etsy CSV and sync all data to website
const csvPath = '/Users/nickparolini/Desktop/Etsy/EtsyListingsDownload.csv';

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && line[i + 1] === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function parseEtsyCSV() {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');
    const products = [];
    
    // Parse header
    const headers = parseCSVLine(lines[0]);
    console.log('Headers found:', headers.length, 'columns');
    
    let currentRow = [];
    let inQuotes = false;
    let currentField = '';
    
    // Process all lines after header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            const nextChar = line[j + 1];
            
            if (char === '"' && nextChar === '"') {
                currentField += '"';
                j++; // Skip next quote
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                currentRow.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        
        // If we're not in quotes, this row is complete
        if (!inQuotes) {
            currentRow.push(currentField);
            currentField = '';
            
            // If we have enough fields, it's a complete product
            if (currentRow.length >= 7) {
                const product = {
                    title: currentRow[0],
                    description: currentRow[1],
                    price: parseFloat(currentRow[2]) || 0,
                    currency: currentRow[3],
                    quantity: parseInt(currentRow[4]) || 0,
                    tags: currentRow[5],
                    materials: currentRow[6],
                    images: []
                };
                
                // Add images (columns 7-16)
                for (let imgIdx = 7; imgIdx <= 16 && imgIdx < currentRow.length; imgIdx++) {
                    if (currentRow[imgIdx] && currentRow[imgIdx].trim()) {
                        product.images.push(currentRow[imgIdx]);
                    }
                }
                
                // Add variation data if present
                if (currentRow.length > 17) {
                    product.variation1Type = currentRow[17] || '';
                    product.variation1Name = currentRow[18] || '';
                    product.variation1Values = currentRow[19] || '';
                    product.variation2Type = currentRow[20] || '';
                    product.variation2Name = currentRow[21] || '';
                    product.variation2Values = currentRow[22] || '';
                    product.sku = currentRow[23] || '';
                }
                
                if (product.title && product.price > 0) {
                    products.push(product);
                }
                currentRow = [];
            }
        } else {
            // Continue with multi-line field
            currentField += '\n';
        }
    }
    
    return products;
}

// Load existing website product data
function loadWebsiteProducts() {
    const productsData = JSON.parse(fs.readFileSync('all-products.json', 'utf-8'));
    return productsData;
}

// Match Etsy products to website products
function matchProducts(etsyProducts, websiteProducts) {
    const matches = [];
    const unmatched = {
        etsy: [],
        website: []
    };
    
    // Create a map for faster lookup
    const etsyMap = new Map();
    etsyProducts.forEach(ep => {
        // Normalize title for matching
        const normalizedTitle = ep.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        etsyMap.set(normalizedTitle, ep);
    });
    
    // Match website products
    websiteProducts.forEach(wp => {
        const wpTitle = wp.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        let matched = false;
        
        // Try exact match first
        if (etsyMap.has(wpTitle)) {
            matches.push({
                websiteProduct: wp,
                etsyProduct: etsyMap.get(wpTitle)
            });
            matched = true;
        } else {
            // Try partial match
            for (const [etsyTitle, etsyProduct] of etsyMap) {
                // Check if titles are similar enough
                if (wpTitle.includes('christmas vacation cat') && etsyTitle.includes('christmas vacation cat')) {
                    matches.push({
                        websiteProduct: wp,
                        etsyProduct: etsyProduct
                    });
                    matched = true;
                    break;
                }
                // More matching logic can be added here
            }
        }
        
        if (!matched) {
            unmatched.website.push(wp);
        }
    });
    
    return { matches, unmatched };
}

// Main execution
console.log('Starting Etsy data sync...\n');

// Parse Etsy CSV
const etsyProducts = parseEtsyCSV();
console.log(`Parsed ${etsyProducts.length} products from Etsy CSV\n`);

// Save parsed Etsy data for reference
fs.writeFileSync('etsy-products-full.json', JSON.stringify(etsyProducts, null, 2));

// Load website products
const websiteProducts = loadWebsiteProducts();
console.log(`Loaded ${websiteProducts.length} products from website\n`);

// Match products
const { matches, unmatched } = matchProducts(etsyProducts, websiteProducts);
console.log(`Matched ${matches.length} products`);
console.log(`Unmatched website products: ${unmatched.website.length}\n`);

// Create mapping file
const mapping = {
    matches: matches.map(m => ({
        websiteId: m.websiteProduct.id,
        websiteName: m.websiteProduct.name,
        etsyTitle: m.etsyProduct.title,
        etsyPrice: m.etsyProduct.price,
        currentWebsitePrice: m.websiteProduct.price,
        priceDifference: m.websiteProduct.price - m.etsyProduct.price,
        quantity: m.etsyProduct.quantity
    })),
    unmatched: unmatched,
    summary: {
        totalMatched: matches.length,
        totalUnmatchedWebsite: unmatched.website.length,
        etsyProductCount: etsyProducts.length,
        websiteProductCount: websiteProducts.length
    }
};

fs.writeFileSync('product-sync-mapping.json', JSON.stringify(mapping, null, 2));

// Find the Christmas Vacation Cat earrings
const christmasVacationCat = etsyProducts.find(p => 
    p.title.includes('Christmas Vacation Cat Earrings') && 
    p.title.includes('Holiday Light Wrapped Cat')
);

if (christmasVacationCat) {
    console.log('Found Christmas Vacation Cat Earrings:');
    console.log(`  Title: ${christmasVacationCat.title}`);
    console.log(`  Price: $${christmasVacationCat.price}`);
    console.log(`  Quantity: ${christmasVacationCat.quantity}`);
    console.log(`  Tags: ${christmasVacationCat.tags}`);
    console.log(`  Images: ${christmasVacationCat.images.length} images\n`);
}

// Summary report
console.log('=== SYNC SUMMARY ===');
console.log(`Total Etsy products: ${etsyProducts.length}`);
console.log(`Total website products: ${websiteProducts.length}`);
console.log(`Successfully matched: ${matches.length}`);
console.log(`Products needing price updates: ${matches.filter(m => Math.abs(m.websiteProduct.price - m.etsyProduct.price) > 0.01).length}`);
console.log('\nMapping saved to: product-sync-mapping.json');
console.log('Full Etsy data saved to: etsy-products-full.json');