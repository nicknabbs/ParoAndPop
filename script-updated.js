// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initCountdown(); // Changed from startCountdown
    setupExitIntent();
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    if (window.location.pathname.includes('checkout.html')) {
        displayOrderSummary();
    }
    if (window.location.pathname.includes('product-')) {
        setupProductPage();
    }
});

// Add to cart function
function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showAddedToCartMessage();
    
    // Track with analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            currency: 'USD',
            value: price,
            items: [{
                item_id: id,
                item_name: name,
                price: price,
                quantity: 1
            }]
        });
    }
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Show added to cart message
function showAddedToCartMessage() {
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✓ Added to Cart';
    button.classList.add('added');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('added');
    }, 2000);
}

// Display cart items
function displayCart() {
    const cartContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything yet!</p>
                <a href="products.html" class="btn-primary">Start Shopping</a>
            </div>
        `;
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <div class="item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">×</button>
            </div>
        `;
    });
    
    cartContainer.innerHTML = cartHTML;
    
    // Update summary - FIXED: Using consistent $5.95 shipping
    const shipping = subtotal >= 50 ? 0 : 5.95;
    const total = subtotal + shipping;
    
    if (cartSummary) {
        cartSummary.innerHTML = `
            <h2>Order Summary</h2>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
            </div>
            ${subtotal < 50 ? `
                <div class="free-shipping-notice">
                    Add $${(50 - subtotal).toFixed(2)} more for FREE shipping!
                </div>
            ` : ''}
            <div class="summary-row summary-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <button class="btn-primary" onclick="proceedToCheckout()">Proceed to Checkout</button>
        `;
    }
}

// Update quantity
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            displayCart();
        }
    }
}

// Remove from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Apply coupon
function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');
    
    if (!couponInput || !couponMessage) return;
    
    const code = couponInput.value.trim().toUpperCase();
    
    // Valid coupon codes and their discounts
    const validCoupons = {
        'SAVE10': 0.10,
        'WELCOME15': 0.15,
        'STOCKING15': 0.15
    };
    
    if (validCoupons[code]) {
        const discount = validCoupons[code];
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = subtotal * discount;
        
        // Store coupon in session
        sessionStorage.setItem('appliedCoupon', code);
        sessionStorage.setItem('couponDiscount', discount);
        
        couponMessage.innerHTML = `<span style="color: green;">✓ Coupon applied! You saved $${discountAmount.toFixed(2)}</span>`;
        
        // Refresh cart display to show discount
        displayCart();
    } else {
        couponMessage.innerHTML = `<span style="color: red;">Invalid coupon code</span>`;
    }
}

// FIXED: Proper persistent countdown timer
function initCountdown() {
    const countdownElements = document.querySelectorAll('#countdown');
    if (countdownElements.length === 0) return;
    
    const OFFER_DURATION = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
    
    // Get or set end time in localStorage
    let endTime = localStorage.getItem('offerEndTime');
    
    if (!endTime || new Date(endTime) <= new Date()) {
        // Set new end time 48 hours from now
        endTime = new Date(Date.now() + OFFER_DURATION).toISOString();
        localStorage.setItem('offerEndTime', endTime);
    }
    
    // Update countdown every second
    const updateTimer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(endTime).getTime();
        let distance = end - now;
        
        if (distance < 0) {
            // Reset for next 48 hours
            endTime = new Date(Date.now() + OFFER_DURATION).toISOString();
            localStorage.setItem('offerEndTime', endTime);
            distance = OFFER_DURATION;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update all countdown displays on the page
        countdownElements.forEach(element => {
            if (days > 0) {
                element.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            } else {
                element.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        });
    }, 1000);
}

// Exit intent popup
function setupExitIntent() {
    let shown = false;
    
    document.addEventListener('mouseout', (e) => {
        if (!shown && e.clientY <= 0 && e.relatedTarget == null) {
            shown = true;
            showExitPopup();
        }
    });
}

// Show exit popup
function showExitPopup() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
        popup.style.display = 'block';
    }
}

// Close popup
function closePopup() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Close banner
function closeBanner() {
    const banner = document.getElementById('saleBanner');
    if (banner) {
        banner.style.display = 'none';
        // Adjust header position
        const header = document.querySelector('header');
        if (header) {
            header.style.top = '0';
        }
    }
}

// Subscribe to newsletter
function subscribeNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    // Here you would normally send to your backend
    console.log('Newsletter subscription for:', email);
    
    // Show success message
    form.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h3 style="color: #4caf50;">✓ Thank you for subscribing!</h3>
            <p>Check your email for a 10% off coupon code.</p>
        </div>
    `;
    
    // Track with analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'newsletter_signup', {
            method: 'footer_form'
        });
    }
}

// Product page setup
function setupProductPage() {
    // Add quantity controls functionality
    const qtyInput = document.getElementById('quantity');
    if (qtyInput) {
        qtyInput.addEventListener('change', (e) => {
            if (e.target.value < 1) e.target.value = 1;
            if (e.target.value > 10) e.target.value = 10;
        });
    }
}

// Load more products
function loadMoreProducts() {
    // This would typically load from an API
    const productsContainer = document.querySelector('.product-grid');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Loading...';
        // Simulate loading
        setTimeout(() => {
            loadMoreBtn.textContent = 'No more products';
            loadMoreBtn.disabled = true;
        }, 1000);
    }
}

// Filter products
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = '';
        } else {
            product.style.display = 'none';
        }
    });
}

// Sort products
function sortProducts(sortBy) {
    const productsContainer = document.querySelector('.product-grid');
    const products = Array.from(productsContainer.querySelectorAll('.product-card'));
    
    products.sort((a, b) => {
        switch(sortBy) {
            case 'price-low':
                return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
            case 'price-high':
                return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
            case 'name':
                return a.dataset.name.localeCompare(b.dataset.name);
            default:
                return 0;
        }
    });
    
    products.forEach(product => productsContainer.appendChild(product));
}

// Proceed to checkout
function proceedToCheckout() {
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Calculate total with fixed shipping cost
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 5.95; // Fixed shipping cost
    const total = subtotal + shipping;
    
    // Store checkout data
    sessionStorage.setItem('checkoutTotal', total.toFixed(2));
    
    // Redirect to checkout (create checkout.html or use external service)
    alert('Checkout functionality would redirect to payment processor.\nTotal: $' + total.toFixed(2));
    // window.location.href = 'checkout.html';
}

// Mobile menu toggle
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (navMenu && hamburger) {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

// Image gallery functionality for product pages
function changeImage(thumb) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage && thumb) {
        mainImage.src = thumb.src;
        // Update active thumbnail
        document.querySelectorAll('.thumbnail-images img').forEach(img => {
            img.classList.remove('active');
        });
        thumb.classList.add('active');
    }
}

// Quantity controls for product pages
function increaseQty() {
    const qty = document.getElementById('quantity');
    if (qty && qty.value < 10) {
        qty.value = parseInt(qty.value) + 1;
    }
}

function decreaseQty() {
    const qty = document.getElementById('quantity');
    if (qty && qty.value > 1) {
        qty.value = parseInt(qty.value) - 1;
    }
}

// Calculate and display order total (for checkout page)
function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 5.95; // Fixed shipping cost
    
    // Check for applied coupon
    const couponDiscount = parseFloat(sessionStorage.getItem('couponDiscount') || 0);
    const discount = subtotal * couponDiscount;
    
    const total = subtotal - discount + shipping;
    
    return {
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        total: total
    };
}

// Display order summary (for checkout page)
function displayOrderSummary() {
    const summaryContainer = document.getElementById('orderSummary');
    if (!summaryContainer) return;
    
    const totals = calculateTotal();
    const appliedCoupon = sessionStorage.getItem('appliedCoupon');
    
    summaryContainer.innerHTML = `
        <h2>Order Summary</h2>
        <div class="order-items">
            ${cart.map(item => `
                <div class="order-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>$${totals.subtotal.toFixed(2)}</span>
        </div>
        ${appliedCoupon ? `
            <div class="summary-row" style="color: green;">
                <span>Discount (${appliedCoupon}):</span>
                <span>-$${totals.discount.toFixed(2)}</span>
            </div>
        ` : ''}
        <div class="summary-row">
            <span>Shipping:</span>
            <span>${totals.shipping === 0 ? 'FREE' : '$' + totals.shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row summary-total">
            <span>Total:</span>
            <span>$${totals.total.toFixed(2)}</span>
        </div>
    `;
}