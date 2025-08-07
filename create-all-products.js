const fs = require('fs');
const path = require('path');

// Get ALL images
const imagesDir = './images';
const productsDir = './products';

// Ensure products directory exists
if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir);
}

// Read ALL image files
const imageFiles = fs.readdirSync(imagesDir).filter(file => file.endsWith('.jpg'));

console.log(`Found ${imageFiles.length} images. Creating product pages...`);

// Extract product name from filename
function getProductName(filename) {
    // Remove extension
    let name = filename.replace('.jpg', '');
    // Remove IMAGE suffix if present
    name = name.replace(/_IMAGE\d+$/, '');
    // Remove product ID prefix if present
    name = name.replace(/^\d+_/, '');
    // Replace underscores with spaces
    name = name.replace(/_/g, ' ');
    return name;
}

// Generate price based on name
function getPrice(filename) {
    const name = filename.toLowerCase();
    if (name.includes('christmas vacation')) return 42;
    if (name.includes('christmas') || name.includes('holiday')) return 35 + Math.floor(Math.random() * 10);
    if (name.includes('halloween')) return 25 + Math.floor(Math.random() * 8);
    if (name.includes('f1') || name.includes('racing')) return 30 + Math.floor(Math.random() * 10);
    if (name.includes('set') || name.includes('collection')) return 35 + Math.floor(Math.random() * 10);
    return 20 + Math.floor(Math.random() * 25);
}

// Generate simple description
function getDescription(name) {
    return `Beautiful handmade ${name.toLowerCase()}. Each pair is carefully crafted with hypoallergenic gold-plated hooks and lightweight wooden materials. Perfect for everyday wear or special occasions. Ships within 1-2 business days in gift-ready packaging.`;
}

// Create HTML for each image
function createProductPage(imageFile) {
    const name = getProductName(imageFile);
    const price = getPrice(imageFile);
    const description = getDescription(name);
    const productId = imageFile.replace('.jpg', '');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | Handmade Earrings</title>
    <meta name="description" content="${name} - Handmade earrings with hypoallergenic hooks. Only $${price}. Free shipping over $50.">
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <div class="sale-banner" id="saleBanner">
        <span class="sale-text">FREE SHIPPING on Orders Over $50! Offer ends in: <span id="countdown">47:59:59</span></span>
        <button class="banner-close" onclick="closeBanner()">×</button>
    </div>
    
    <header>
        <nav>
            <div class="nav-container">
                <div class="logo">
                    <a href="/">Artisan Earrings Co.</a>
                </div>
                <ul class="nav-menu">
                    <li><a href="/">Home</a></li>
                    <li><a href="/products.html">Shop All</a></li>
                    <li><a href="/about.html">About</a></li>
                    <li><a href="/contact.html">Contact</a></li>
                    <li class="cart-link">
                        <a href="/cart.html">Cart (<span id="cartCount">0</span>)</a>
                    </li>
                </ul>
                <div class="hamburger" onclick="toggleMenu()">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </nav>
    </header>
    
    <div class="container" style="padding: 40px 20px;">
        <div style="margin-bottom: 20px;">
            <a href="/products.html" style="color: #666; text-decoration: none;">← Back to Shop</a>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1200px; margin: 0 auto;">
            <div>
                <img src="../images/${imageFile}" alt="${name}" style="width: 100%; border-radius: 8px;">
            </div>
            
            <div>
                <h1 style="font-size: 32px; margin-bottom: 20px;">${name}</h1>
                <div style="font-size: 36px; color: #d4624a; font-weight: bold; margin-bottom: 20px;">$${price}.00</div>
                
                <p style="color: #28a745; margin-bottom: 20px;">✓ In Stock - Only ${2 + Math.floor(Math.random() * 4)} left!</p>
                
                <p style="line-height: 1.6; margin-bottom: 30px;">${description}</p>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="margin-bottom: 10px;">Features:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 8px;">✓ Hypoallergenic gold-plated hooks</li>
                        <li style="margin-bottom: 8px;">✓ Lightweight wooden construction</li>
                        <li style="margin-bottom: 8px;">✓ Approximately 1.5 inches</li>
                        <li style="margin-bottom: 8px;">✓ Handmade in USA</li>
                        <li style="margin-bottom: 8px;">✓ Ships in 1-2 business days</li>
                    </ul>
                </div>
                
                <button class="btn-primary" style="width: 100%; padding: 15px; font-size: 18px;" 
                        onclick="addToCart('${productId}', '${name.replace(/'/g, "\\'")}', ${price}, '../images/${imageFile}')">
                    Add to Cart - ${price < 50 ? 'Add $' + (50 - price) + ' more for FREE shipping!' : 'FREE Shipping!'}
                </button>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px;">
                        🔥 ${5 + Math.floor(Math.random() * 10)} people viewed this today<br>
                        📦 ${price >= 50 ? 'This item qualifies for FREE shipping!' : 'Free shipping on orders over $50'}
                    </p>
                </div>
            </div>
        </div>
    </div>
    
    <footer style="margin-top: 60px;">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-column">
                    <h3>Shop</h3>
                    <ul>
                        <li><a href="/products.html">All Products</a></li>
                        <li><a href="/bestsellers.html">Bestsellers</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Customer Care</h3>
                    <ul>
                        <li><a href="/shipping-policy.html">Shipping</a></li>
                        <li><a href="/returns-policy.html">Returns</a></li>
                        <li><a href="/faq.html">FAQ</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>About</h3>
                    <ul>
                        <li><a href="/about.html">Our Story</a></li>
                        <li><a href="/contact.html">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Connect</h3>
                    <div class="social-links">
                        <a href="#">📘</a>
                        <a href="#">📷</a>
                        <a href="#">📌</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    
    <script src="../script.js"></script>
</body>
</html>`;
    
    return html;
}

// Create product page for EVERY image
let created = 0;
imageFiles.forEach((imageFile, index) => {
    const productId = imageFile.replace('.jpg', '');
    const html = createProductPage(imageFile);
    const filepath = path.join(productsDir, `${productId}.html`);
    
    fs.writeFileSync(filepath, html);
    created++;
    
    if (created % 50 === 0) {
        console.log(`Created ${created} of ${imageFiles.length} product pages...`);
    }
});

console.log(`✅ Successfully created ${created} product pages!`);

// Also create products data for the main products page
const allProducts = imageFiles.map((imageFile, index) => {
    const name = getProductName(imageFile);
    const productId = imageFile.replace('.jpg', '');
    return {
        id: productId,
        name: name,
        price: getPrice(imageFile),
        image: imageFile,
        link: `/products/${productId}.html`
    };
});

fs.writeFileSync('./all-products.json', JSON.stringify(allProducts, null, 2));
console.log('✅ Created all-products.json with all ' + allProducts.length + ' products');