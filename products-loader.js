// Products loader with working Load More functionality
let allProducts = [];
let currentPage = 0;
const productsPerPage = 30;

// Load products when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Load all products from JSON
    try {
        const response = await fetch('/all-products.json');
        allProducts = await response.json();
        
        // Display initial products
        displayProducts();
        
        // Setup filter and sort handlers
        document.getElementById('categoryFilter')?.addEventListener('change', filterAndSort);
        document.getElementById('sortBy')?.addEventListener('change', filterAndSort);
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback: show error message
        document.getElementById('productsGrid').innerHTML = '<p>Error loading products. Please refresh the page.</p>';
    }
});

function displayProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const start = currentPage * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = getFilteredProducts().slice(0, end);
    
    // Clear and rebuild grid
    grid.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-category="${getCategoryFromName(product.name)}" data-price="${product.price}">
            <a href="${product.link}">
                <img src="./images/${product.image}" alt="${product.name}" loading="lazy">
                <h3>${product.name}</h3>
                <p class="price">$${product.price}</p>
                <p class="stock">Only ${2 + Math.floor(Math.random() * 4)} left!</p>
            </a>
            <button onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, './images/${product.image}')">
                Quick Add
            </button>
        </div>
    `).join('');
    
    // Update counter
    updateProductCounter(productsToShow.length, getFilteredProducts().length);
    
    // Update Load More button
    updateLoadMoreButton();
}

function loadMoreProducts() {
    currentPage++;
    displayProducts();
}

function getFilteredProducts() {
    const filter = document.getElementById('categoryFilter')?.value || 'all';
    const sortBy = document.getElementById('sortBy')?.value || 'featured';
    
    let filtered = [...allProducts];
    
    // Apply filter
    if (filter !== 'all') {
        filtered = filtered.filter(product => {
            const category = getCategoryFromName(product.name);
            return category === filter;
        });
    }
    
    // Apply sorting
    if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return filtered;
}

function filterAndSort() {
    currentPage = 0; // Reset to first page
    displayProducts();
}

function getCategoryFromName(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('christmas') || nameLower.includes('santa') || nameLower.includes('rudolf') || nameLower.includes('snowman')) return 'christmas';
    if (nameLower.includes('halloween') || nameLower.includes('skeleton') || nameLower.includes('ghost') || nameLower.includes('spooky')) return 'halloween';
    if (nameLower.includes('easter') || nameLower.includes('bunny')) return 'easter';
    if (nameLower.includes('f1') || nameLower.includes('racing') || nameLower.includes('formula')) return 'racing';
    if (nameLower.includes('music') || nameLower.includes('band') || nameLower.includes('friends') || nameLower.includes('guster')) return 'music';
    if (nameLower.includes('football') || nameLower.includes('super bowl') || nameLower.includes('sports')) return 'sports';
    if (nameLower.includes('plant') || nameLower.includes('leaf') || nameLower.includes('flower') || nameLower.includes('nature') || nameLower.includes('sea') || nameLower.includes('beach')) return 'nature';
    if (nameLower.includes('coffee') || nameLower.includes('food') || nameLower.includes('strawberry') || nameLower.includes('chili')) return 'food';
    return 'other';
}

function updateProductCounter(showing, total) {
    const counter = document.querySelector('.product-counter');
    if (counter) {
        counter.textContent = `Showing ${showing} of ${total} products`;
    }
}

function updateLoadMoreButton() {
    const button = document.getElementById('loadMoreBtn');
    if (!button) return;
    
    const filtered = getFilteredProducts();
    const showing = Math.min((currentPage + 1) * productsPerPage, filtered.length);
    
    if (showing >= filtered.length) {
        button.style.display = 'none';
    } else {
        button.style.display = 'block';
        button.textContent = `Load More Products (${filtered.length - showing} remaining)`;
    }
}