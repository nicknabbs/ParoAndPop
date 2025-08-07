const fs = require('fs');
const path = require('path');

// Read and properly parse the Etsy CSV
const csvPath = '/Users/nickparolini/Desktop/Etsy/EtsyListingsDownload.csv';

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
                    price: parseFloat(currentRow[2]) || 25,
                    currency: currentRow[3],
                    quantity: currentRow[4],
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
                
                products.push(product);
                currentRow = [];
            }
        } else {
            // Continue with multi-line field
            currentField += '\n';
        }
    }
    
    return products;
}

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

// Parse the CSV
console.log('Parsing Etsy CSV...');
const products = parseEtsyCSV();
console.log(`Found ${products.length} products`);

// Save to JSON for inspection
const outputPath = './etsy-products.json';
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
console.log(`Saved products to ${outputPath}`);

// Show sample products
console.log('\nFirst 5 products:');
products.slice(0, 5).forEach((p, i) => {
    console.log(`${i + 1}. ${p.title.substring(0, 60)}... - $${p.price}`);
});

console.log('\nLast 5 products:');
products.slice(-5).forEach((p, i) => {
    console.log(`${products.length - 4 + i}. ${p.title.substring(0, 60)}... - $${p.price}`);
});

// Map products to our existing files
console.log('\n=== Mapping to Product Files ===');
const imageFiles = fs.readdirSync('./images').filter(f => f.endsWith('.jpg'));

// Group image files by product ID
const productImageMap = {};
imageFiles.forEach(file => {
    const match = file.match(/^(\d+)_/);
    if (match) {
        const id = match[1];
        if (!productImageMap[id]) {
            productImageMap[id] = [];
        }
        productImageMap[id].push(file);
    }
});

console.log(`Found ${Object.keys(productImageMap).length} product IDs in images folder`);

// Create mapping based on product order
const productMapping = {};
products.forEach((product, index) => {
    const productId = index + 1; // 1-based indexing
    if (productId <= 131) {
        productMapping[productId] = product;
        console.log(`Mapped product ${productId}: ${product.title.substring(0, 50)}...`);
    }
});

// Save mapping
fs.writeFileSync('./product-mapping.json', JSON.stringify(productMapping, null, 2));
console.log(`\nCreated mapping for ${Object.keys(productMapping).length} products`);
console.log('Mapping saved to product-mapping.json');