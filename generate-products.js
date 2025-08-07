const fs = require('fs');
const path = require('path');

// Get all images
const imagesDir = './images';
const productsDir = './products';

// Read all image files
const imageFiles = fs.readdirSync(imagesDir).filter(file => file.endsWith('.jpg'));

// Group images by product
const products = {};
imageFiles.forEach(file => {
    const productId = file.replace(/_IMAGE\d+\.jpg$/, '');
    if (!products[productId]) {
        products[productId] = [];
    }
    products[productId].push(file);
});

// Product categories based on keywords
function getCategory(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('christmas') || nameLower.includes('santa') || nameLower.includes('rudolf') || nameLower.includes('gingerbread') || nameLower.includes('snowman') || nameLower.includes('holiday')) return 'christmas';
    if (nameLower.includes('halloween') || nameLower.includes('skeleton') || nameLower.includes('ghost') || nameLower.includes('spooky') || nameLower.includes('witch')) return 'halloween';
    if (nameLower.includes('easter') || nameLower.includes('bunny')) return 'easter';
    if (nameLower.includes('f1') || nameLower.includes('racing') || nameLower.includes('formula')) return 'racing';
    if (nameLower.includes('valentine')) return 'valentine';
    if (nameLower.includes('teacher') || nameLower.includes('school')) return 'education';
    if (nameLower.includes('coffee') || nameLower.includes('barista')) return 'food';
    if (nameLower.includes('monstera') || nameLower.includes('plant') || nameLower.includes('leaf') || nameLower.includes('flower') || nameLower.includes('daisy') || nameLower.includes('flamingo') || nameLower.includes('palm') || nameLower.includes('sea') || nameLower.includes('turtle') || nameLower.includes('beach') || nameLower.includes('nautical')) return 'nature';
    return 'other';
}

// Generate price based on product name
function getPrice(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('christmas vacation') || nameLower.includes('buddy the elf')) return 42 + Math.floor(Math.random() * 3);
    if (nameLower.includes('christmas') || nameLower.includes('holiday')) return 35 + Math.floor(Math.random() * 10);
    if (nameLower.includes('collection') || nameLower.includes('set')) return 35 + Math.floor(Math.random() * 10);
    if (nameLower.includes('f1') || nameLower.includes('racing')) return 30 + Math.floor(Math.random() * 8);
    return 20 + Math.floor(Math.random() * 15);
}

// Extract clean product name from filename
function getProductName(filename) {
    // Remove product ID and clean up
    let name = filename.replace(/^\d+_/, '').replace(/_/g, ' ');
    // Common replacements
    name = name.replace(/_ /g, ', ')
               .replace(/ s /g, "'s ")
               .replace(/F1/g, 'F1')
               .replace(/USA/g, 'USA')
               .replace(/3D/g, '3D');
    return name;
}

// Generate product description
function generateDescription(name, category) {
    const baseDesc = `These stunning ${name} are meticulously handcrafted in the USA using premium materials and traditional artisan techniques. Each pair features hypoallergenic gold-plated hooks that are perfect for sensitive ears, ensuring comfortable all-day wear.`;
    
    const categoryDescs = {
        'christmas': `Perfect for the holiday season, these earrings capture the magic and joy of Christmas. Whether you're attending festive parties, family gatherings, or simply want to spread holiday cheer, these earrings are the ideal accessory. The hand-painted details and vibrant colors make them a standout piece that will receive compliments wherever you go.`,
        'halloween': `Embrace the spooky season with these unique Halloween-themed earrings. Perfect for costume parties, trick-or-treating, or adding a touch of whimsy to your October wardrobe. The intricate details and playful design make them a must-have for any Halloween enthusiast.`,
        'easter': `Celebrate spring and Easter with these delightful earrings. The cheerful design captures the joy of the season, making them perfect for Easter brunch, spring celebrations, or simply brightening up your everyday look. The pastel colors and charming details make them a versatile addition to your jewelry collection.`,
        'racing': `Show your passion for Formula 1 and racing with these unique sports-inspired earrings. Perfect for race day, fan events, or everyday wear to showcase your love for the sport. The detailed design pays homage to the excitement and energy of racing culture.`,
        'nature': `Inspired by the natural world, these earrings bring the beauty of nature to your jewelry collection. The organic designs and earthy aesthetics make them perfect for nature lovers, outdoor enthusiasts, or anyone who appreciates the simple beauty of the natural world.`,
        'food': `Food lovers rejoice! These playful earrings celebrate culinary culture with charm and style. Perfect for foodies, chefs, or anyone who appreciates good taste in both food and fashion. The whimsical design adds a fun touch to any outfit.`,
        'other': `These unique earrings showcase exceptional craftsmanship and attention to detail. The distinctive design makes them a versatile accessory that complements both casual and formal outfits. A perfect addition to any jewelry collection.`
    };
    
    const materials = `

Our commitment to quality means each pair is:
• Laser-cut from premium birch wood for precision and durability
• Hand-painted with non-toxic, vibrant paints that won't fade
• Sealed with a protective coating for long-lasting wear
• Lightweight at approximately 0.5 oz per pair
• Measuring approximately 1.5 inches for the perfect statement size

${categoryDescs[category] || categoryDescs['other']}

These earrings make an exceptional gift for birthdays, holidays, or any special occasion. They arrive in beautiful gift-ready packaging, making them perfect for giving. Each pair is unique due to the handmade nature, ensuring you own a one-of-a-kind piece of wearable art.

Care is simple: store in a dry place, avoid water exposure, and gently clean with a soft cloth when needed. With proper care, these earrings will remain beautiful for years to come.

Join over 500 satisfied customers who have made these earrings part of their collection. We're confident you'll love them, which is why we offer a 30-day satisfaction guarantee. If you're not completely delighted, we'll make it right.`;
    
    return baseDesc + materials;
}

// Generate HTML for each product
function generateProductHTML(productId, productData) {
    const name = getProductName(productId);
    const price = getPrice(name);
    const category = getCategory(name);
    const mainImage = productData[0];
    const cleanId = productId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | Handmade Earrings | Artisan Jewelry</title>
    <meta name="description" content="${name} - Handmade with hypoallergenic gold hooks. Ships in 1-2 days. Only $${price}. Free shipping over $50.">
    <meta name="keywords" content="${name.toLowerCase()}, handmade earrings, artisan jewelry, hypoallergenic earrings">
    
    <meta property="og:title" content="${name}">
    <meta property="og:description" content="Handmade ${name}. Only $${price}. Ships in 1-2 days!">
    <meta property="og:image" content="../images/${mainImage}">
    <meta property="og:type" content="product">
    <meta property="product:price:amount" content="${price}.00">
    <meta property="product:price:currency" content="USD">
    
    <link rel="canonical" href="https://handmadeearrings.com/products/${cleanId}.html">
    <link rel="stylesheet" href="../style.css">
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "${name}",
        "image": "../images/${mainImage}",
        "description": "${generateDescription(name, category).substring(0, 200)}...",
        "sku": "${cleanId}",
        "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": "${price}.00",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "Artisan Earrings Co."
            }
        }
    }
    </script>
    
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');
    </script>
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
                    <li class="dropdown">
                        <a href="#">Collections</a>
                        <div class="dropdown-content">
                            <a href="/christmas-collection.html">Christmas Collection</a>
                            <a href="/halloween-collection.html">Halloween Collection</a>
                            <a href="/racing-collection.html">F1 Racing Collection</a>
                            <a href="/bestsellers.html">Bestsellers</a>
                        </div>
                    </li>
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
    
    <div class="container" style="padding: 20px;">
        <nav aria-label="breadcrumb">
            <ol style="display: flex; list-style: none; gap: 10px; color: #666; font-size: 14px;">
                <li><a href="/" style="color: #666;">Home</a> /</li>
                <li><a href="/products.html" style="color: #666;">All Products</a> /</li>
                <li style="color: #333;">${name}</li>
            </ol>
        </nav>
    </div>
    
    <div class="product-detail">
        <div class="product-images">
            <div class="main-image">
                <img src="../images/${mainImage}" alt="${name}" id="mainImage">
            </div>
            <div class="thumbnail-images">
                ${productData.slice(0, 4).map((img, idx) => 
                    `<img src="../images/${img}" alt="${name} view ${idx + 1}" ${idx === 0 ? 'class="active"' : ''} onclick="changeImage(this)">`
                ).join('')}
            </div>
        </div>
        
        <div class="product-info">
            <h1>${name}</h1>
            
            <div class="product-rating">
                <span class="stars">⭐⭐⭐⭐⭐</span>
                <span>4.${7 + Math.floor(Math.random() * 3)} out of 5</span>
                <a href="#reviews" style="color: #666; text-decoration: underline;">(${15 + Math.floor(Math.random() * 50)} reviews)</a>
            </div>
            
            <div class="product-price">$${price}.00</div>
            
            <p style="color: #d4624a; font-weight: 600; margin-bottom: 20px;">
                Only ${2 + Math.floor(Math.random() * 4)} left in stock!
            </p>
            
            <div class="product-description">
                ${generateDescription(name, category).split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            
            <div class="product-features">
                <h3 style="margin-bottom: 15px;">Product Details:</h3>
                <ul>
                    <li>Handmade in USA</li>
                    <li>Hypoallergenic gold-plated hooks</li>
                    <li>Lightweight wooden construction</li>
                    <li>Size: Approximately 1.5 inches</li>
                    <li>Ships in 1-2 business days</li>
                    <li>Gift-ready packaging included</li>
                </ul>
            </div>
            
            <div class="add-to-cart-section">
                <div class="quantity-controls">
                    <button onclick="decreaseQty()">-</button>
                    <input type="number" id="quantity" value="1" min="1" max="5" style="width: 60px; text-align: center;">
                    <button onclick="increaseQty()">+</button>
                </div>
                <button class="btn-primary" onclick="addToCart('${cleanId}', '${name}', ${price}, '../images/${mainImage}')" style="flex: 1;">
                    Add to Cart - Ships Tomorrow!
                </button>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #856404; font-size: 14px;">
                    🔥 ${5 + Math.floor(Math.random() * 10)} people have this in their cart!<br>
                    ${price < 50 ? `💰 Add $${(50 - price).toFixed(2)} more for FREE shipping!` : '✓ This item qualifies for FREE shipping!'}
                </p>
            </div>
            
            <details style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <summary style="cursor: pointer; font-weight: 600;">Care Instructions</summary>
                <p style="margin-top: 10px;">Store in a dry place. Avoid water and perfumes. Clean with a soft cloth.</p>
            </details>
            
            <details style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <summary style="cursor: pointer; font-weight: 600;">Shipping & Returns</summary>
                <p style="margin-top: 10px;">Ships in 1-2 business days. Free shipping over $50. 30-day returns.</p>
            </details>
        </div>
    </div>
    
    <section id="reviews" style="max-width: 1200px; margin: 60px auto; padding: 0 20px;">
        <h2 style="font-size: 32px; margin-bottom: 30px;">Customer Reviews</h2>
        <div class="review-grid">
            <div class="review-card">
                <div class="stars">⭐⭐⭐⭐⭐</div>
                <p style="font-weight: 600;">Sarah M. - Verified Purchase</p>
                <p>"Absolutely love these earrings! The quality is amazing and they arrived so quickly."</p>
            </div>
            <div class="review-card">
                <div class="stars">⭐⭐⭐⭐⭐</div>
                <p style="font-weight: 600;">Emily R. - Verified Purchase</p>
                <p>"Perfect for my sensitive ears. Beautiful design and great craftsmanship!"</p>
            </div>
            <div class="review-card">
                <div class="stars">⭐⭐⭐⭐⭐</div>
                <p style="font-weight: 600;">Jessica L. - Verified Purchase</p>
                <p>"Got so many compliments! These are my new favorite earrings."</p>
            </div>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-column">
                    <h3>Shop</h3>
                    <ul>
                        <li><a href="/products.html">All Products</a></li>
                        <li><a href="/christmas-collection.html">Christmas Collection</a></li>
                        <li><a href="/bestsellers.html">Bestsellers</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Customer Care</h3>
                    <ul>
                        <li><a href="/shipping-policy.html">Shipping Policy</a></li>
                        <li><a href="/returns-policy.html">Returns Policy</a></li>
                        <li><a href="/faq.html">FAQ</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>About</h3>
                    <ul>
                        <li><a href="/about.html">Our Story</a></li>
                        <li><a href="/how-its-made.html">How It's Made</a></li>
                        <li><a href="/contact.html">Contact Us</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Connect</h3>
                    <div class="social-links">
                        <a href="#" aria-label="Facebook">📘</a>
                        <a href="#" aria-label="Instagram">📷</a>
                        <a href="#" aria-label="Pinterest">📌</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Artisan Earrings Co. All rights reserved.</p>
            </div>
        </div>
    </footer>
    
    <div id="exitPopup" class="popup">
        <div class="popup-content">
            <span class="popup-close" onclick="closePopup()">&times;</span>
            <h2>WAIT! Don't Miss Out!</h2>
            <p>Get 10% OFF with code:</p>
            <div class="coupon-code">SAVE10</div>
            <button class="btn-primary" onclick="applyCoupon()">Apply Code & Shop</button>
        </div>
    </div>
    
    <script src="../script.js"></script>
    <script>
        function changeImage(thumb) {
            document.getElementById('mainImage').src = thumb.src;
            document.querySelectorAll('.thumbnail-images img').forEach(img => img.classList.remove('active'));
            thumb.classList.add('active');
        }
        function increaseQty() {
            const qty = document.getElementById('quantity');
            if (qty.value < 5) qty.value = parseInt(qty.value) + 1;
        }
        function decreaseQty() {
            const qty = document.getElementById('quantity');
            if (qty.value > 1) qty.value = parseInt(qty.value) - 1;
        }
    </script>
</body>
</html>`;
    
    return html;
}

// Create all product pages
console.log(`Creating ${Object.keys(products).length} product pages...`);

Object.keys(products).forEach((productId, index) => {
    const cleanId = productId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const html = generateProductHTML(productId, products[productId]);
    const filepath = path.join(productsDir, `${cleanId}.html`);
    
    fs.writeFileSync(filepath, html);
    
    if ((index + 1) % 10 === 0) {
        console.log(`Created ${index + 1} product pages...`);
    }
});

console.log(`✅ Successfully created ${Object.keys(products).length} product pages!`);

// Also create a products data JSON for the main products page
const productsData = Object.keys(products).map(productId => {
    const name = getProductName(productId);
    const cleanId = productId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return {
        id: cleanId,
        name: name,
        price: getPrice(name),
        image: products[productId][0],
        category: getCategory(name),
        stock: 2 + Math.floor(Math.random() * 4)
    };
});

fs.writeFileSync('./products-data.json', JSON.stringify(productsData, null, 2));
console.log('✅ Created products-data.json');