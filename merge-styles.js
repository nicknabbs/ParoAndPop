#!/usr/bin/env node

const fs = require('fs');

// Read the old style.css to extract homepage-specific styles
const oldStyle = fs.readFileSync('style-old.css', 'utf-8');

// Extract hero section and other homepage styles from old CSS
const heroStyles = `

/* ============================================
   HOMEPAGE SPECIFIC STYLES
   ============================================ */

/* Hero Section */
.hero {
    padding: 60px 0;
    background: linear-gradient(135deg, #fff 0%, var(--accent-color) 100%);
}

.hero-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}

.hero-text h1 {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 5vw, 3rem);
    line-height: 1.2;
    margin-bottom: 20px;
    color: var(--text-dark);
}

.hero-subtitle {
    font-size: 1.25rem;
    color: var(--primary-color);
    margin-bottom: 20px;
    font-family: var(--font-body);
    font-weight: 600;
}

.hero-description {
    font-size: 1.125rem;
    color: var(--text-light);
    margin-bottom: 30px;
    line-height: 1.6;
}

.hero-price {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
}

.hero-price .price {
    font-family: var(--font-display);
    font-size: 2.25rem;
    font-weight: bold;
    color: var(--primary-color);
}

.stock-alert {
    background: #fff3cd;
    color: #856404;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.hero-cta {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.social-proof {
    display: flex;
    align-items: center;
    gap: 15px;
}

.social-proof img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid white;
    margin-left: -10px;
}

.social-proof img:first-child {
    margin-left: 0;
}

.social-proof span {
    color: var(--text-light);
    font-size: 0.875rem;
}

.hero-image {
    position: relative;
}

.hero-image img {
    width: 100%;
    height: auto;
    border-radius: 20px;
    box-shadow: var(--shadow-hover);
}

/* Category Grid */
.categories {
    padding: 80px 0;
    background: white;
}

.categories h2 {
    font-family: var(--font-display);
    text-align: center;
    font-size: clamp(2rem, 4vw, 2.5rem);
    margin-bottom: 50px;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.category-card {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: var(--shadow);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
}

.category-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
}

.category-card img {
    width: 100%;
    height: 300px;
    object-fit: cover;
}

.category-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: white;
    padding: 30px 20px 20px;
}

.category-info h3 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    margin-bottom: 5px;
}

.category-info p {
    font-size: 0.875rem;
    opacity: 0.9;
}

/* Featured Products */
.featured-products {
    padding: 80px 0;
    background: var(--accent-color);
}

.featured-products h2 {
    font-family: var(--font-display);
    text-align: center;
    font-size: clamp(2rem, 4vw, 2.5rem);
    margin-bottom: 50px;
}

/* Reviews Section */
.reviews {
    padding: 80px 0;
    background: white;
}

.reviews h2 {
    font-family: var(--font-display);
    text-align: center;
    font-size: clamp(2rem, 4vw, 2.5rem);
    margin-bottom: 50px;
}

.review-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.review-card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    text-align: center;
}

.review-rating {
    color: #ffc107;
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.review-text {
    font-style: italic;
    color: var(--text-light);
    margin-bottom: 20px;
    line-height: 1.6;
}

.review-author {
    font-weight: 600;
    color: var(--text-dark);
}

/* Popup Styles */
.popup {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    animation: fadeIn 0.3s;
}

.popup-content {
    background-color: white;
    margin: 10% auto;
    padding: 40px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    text-align: center;
    position: relative;
    animation: slideUp 0.3s;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.popup-close {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 30px;
    cursor: pointer;
    color: var(--text-light);
}

.popup h2 {
    font-family: var(--font-display);
    color: var(--primary-color);
    margin-bottom: 20px;
}

.coupon-code {
    background: var(--accent-color);
    font-size: 2rem;
    font-weight: bold;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
    font-family: monospace;
}

/* Product Detail Specific */
.product-features ul {
    list-style: none;
    padding: 0;
}

.product-features li {
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color);
    position: relative;
    padding-left: 25px;
}

.product-features li:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--success-color);
    font-weight: bold;
}

.add-to-cart-section {
    display: flex;
    gap: 20px;
    align-items: center;
    margin: 30px 0;
}

.quantity-controls {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
}

.quantity-controls button {
    background: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 1.25rem;
    color: var(--text-dark);
}

.quantity-controls button:hover {
    background: var(--accent-color);
}

.quantity-controls input {
    width: 60px;
    text-align: center;
    border: none;
    padding: 10px;
    font-size: 1rem;
    margin: 0;
}

/* Related Products */
.related-products {
    padding: 60px 0;
    background: var(--accent-color);
}

.related-products h2 {
    font-family: var(--font-display);
    text-align: center;
    font-size: 2rem;
    margin-bottom: 40px;
}

/* Cart Page Specific */
.cart-container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
}

.cart-items {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: var(--shadow);
}

.cart-item {
    display: grid;
    grid-template-columns: 100px 1fr auto;
    gap: 20px;
    padding: 20px 0;
    border-bottom: 1px solid var(--border-color);
    align-items: center;
}

.cart-item img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
}

.cart-summary {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    height: fit-content;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--border-color);
}

.summary-total {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
}

/* Collection Hero */
.collection-hero {
    background: linear-gradient(135deg, var(--accent-color), white);
    padding: 60px 20px;
    text-align: center;
}

.collection-hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 20px;
}

.collection-hero p {
    font-size: 1.125rem;
    color: var(--text-light);
    max-width: 600px;
    margin: 0 auto;
}

/* Collection Filters */
.collection-filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px;
    max-width: 1200px;
    margin: 0 auto;
    flex-wrap: wrap;
    gap: 20px;
}

.results-count {
    color: var(--text-light);
}

.collection-filters select {
    padding: 10px 15px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: white;
    cursor: pointer;
}

/* Page Content */
.page-header {
    text-align: center;
    margin-bottom: 40px;
}

.page-subtitle {
    font-size: 1.125rem;
    color: var(--text-light);
    margin-top: 10px;
}

/* Responsive Design for Homepage */
@media (max-width: 768px) {
    .hero-content {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
    }
    
    .hero-text h1 {
        font-size: 2rem;
    }
    
    .hero-cta {
        flex-direction: column;
        align-items: center;
    }
    
    .hero-cta .btn-primary,
    .hero-cta .btn-secondary {
        width: 100%;
    }
    
    .category-grid {
        grid-template-columns: 1fr;
    }
    
    .review-grid {
        grid-template-columns: 1fr;
    }
    
    .cart-container {
        grid-template-columns: 1fr;
    }
    
    .popup-content {
        width: 95%;
        margin: 20% auto;
        padding: 30px 20px;
    }
}

/* Add to cart button animations */
@keyframes addToCart {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.btn-primary.added {
    animation: addToCart 0.5s ease;
    background: var(--success-color);
}

/* Shipping info section */
.shipping-info {
    background: #f8f9fa;
    padding: 40px;
    border-radius: 12px;
    margin: 40px 0;
}

.shipping-table {
    overflow-x: auto;
    margin: 30px 0;
}

.shipping-table table {
    width: 100%;
    background: white;
    border-radius: 8px;
    overflow: hidden;
}

.policy-note {
    background: #fff3cd;
    color: #856404;
    padding: 15px;
    border-radius: 8px;
    margin: 30px 0;
}

/* Contact form specific */
.contact-form {
    max-width: 600px;
    margin: 40px auto;
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: var(--shadow);
}

.form-group {
    margin-bottom: 25px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--text-dark);
}

/* About page specific */
.about-hero {
    text-align: center;
    padding: 60px 20px;
    background: linear-gradient(135deg, var(--accent-color), white);
}

.about-content {
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.8;
    padding: 40px 20px;
}

/* FAQ specific */
.faq-categories {
    display: flex;
    gap: 15px;
    margin-bottom: 40px;
    flex-wrap: wrap;
    justify-content: center;
}

.faq-category {
    padding: 10px 20px;
    background: white;
    border: 2px solid var(--primary-color);
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s;
}

.faq-category:hover,
.faq-category.active {
    background: var(--primary-color);
    color: white;
}

.faq-category-content {
    max-width: 800px;
    margin: 0 auto;
}

/* Mobile menu styles */
@media (max-width: 768px) {
    .nav-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 20px;
        box-shadow: var(--shadow-hover);
    }
    
    .nav-menu.active {
        display: flex;
    }
    
    .hamburger {
        display: flex;
    }
}
`;

// Read current style.css
let currentStyle = fs.readFileSync('style.css', 'utf-8');

// Check if homepage styles are already present
if (!currentStyle.includes('HOMEPAGE SPECIFIC STYLES')) {
    // Append homepage styles to the end of the file
    currentStyle = currentStyle.replace(/\n$/, '') + heroStyles;
    
    // Write updated style.css
    fs.writeFileSync('style.css', currentStyle);
    console.log('✅ Successfully merged homepage-specific styles into style.css');
} else {
    console.log('⚠️ Homepage styles already present in style.css');
}

console.log('\nThe design should now be fully visible with:');
console.log('- Playfair Display font for headers');
console.log('- Special ampersand styling for Paro & Pop');
console.log('- Hero section styling');
console.log('- Category grid styling');
console.log('- All responsive design fixes');