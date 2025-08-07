// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    startCountdown();
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
    const message = document.createElement('div');
    message.className = 'success-message show';
    message.textContent = '✓ Added to cart successfully!';
    message.style.position = 'fixed';
    message.style.top = '100px';
    message.style.right = '20px';
    message.style.zIndex = '10000';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Display cart items
function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Your cart is empty. <a href="products.html">Continue shopping</a></p>';
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <div class="item-total">
                    <p style="font-size: 18px; font-weight: bold;">$${itemTotal.toFixed(2)}</p>
                    <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #999; cursor: pointer; text-decoration: underline;">Remove</button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Update summary with free shipping message
    const shipping = subtotal >= 50 ? 0 : 5.95;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    
    // Update shipping with free shipping message
    const shippingElement = document.getElementById('shipping');
    if (shipping === 0) {
        shippingElement.innerHTML = '<span style="color: #28a745;">✓ FREE SHIPPING</span>';
    } else {
        const amountToFree = (50 - subtotal).toFixed(2);
        shippingElement.innerHTML = `$${shipping.toFixed(2)}<br><small style="color: #666;">Add $${amountToFree} more for free shipping</small>`;
    }
    
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
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
    
    if (couponInput && couponInput.value.toUpperCase() === 'SAVE10') {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = subtotal * 0.1;
        
        if (couponMessage) {
            couponMessage.textContent = `Coupon applied! You saved $${discount.toFixed(2)}`;
            couponMessage.style.color = 'green';
        }
        
        // Update total with discount
        setTimeout(() => {
            displayCart();
        }, 100);
    } else if (couponMessage) {
        couponMessage.textContent = 'Invalid coupon code';
        couponMessage.style.color = 'red';
    }
    
    // Also close popup if this was called from popup
    closePopup();
    if (couponInput) {
        couponInput.value = 'SAVE10';
    }
}

// Countdown timer with 48-hour reset using localStorage
function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    // Get or set the reset timestamp (48 hours from first visit)
    let resetTime = localStorage.getItem('bannerResetTime');
    const now = Date.now();
    
    if (!resetTime || now > parseInt(resetTime)) {
        // Set new reset time 48 hours from now
        resetTime = now + (48 * 60 * 60 * 1000);
        localStorage.setItem('bannerResetTime', resetTime);
    }
    
    setInterval(() => {
        const currentTime = Date.now();
        const timeLeft = parseInt(resetTime) - currentTime;
        
        if (timeLeft <= 0) {
            // Reset for another 48 hours
            resetTime = Date.now() + (48 * 60 * 60 * 1000);
            localStorage.setItem('bannerResetTime', resetTime);
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        countdownElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

function showExitPopup() {
    const popup = document.getElementById('exitPopup');
    if (popup && !sessionStorage.getItem('exitPopupShown')) {
        popup.style.display = 'block';
        sessionStorage.setItem('exitPopupShown', 'true');
    }
}

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
        document.querySelector('header').style.top = '0';
    }
}

// Toggle mobile menu
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Enhanced dropdown control
document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        let timeout;
        
        // Desktop hover with delay
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(timeout);
            dropdown.classList.add('active');
        });
        
        dropdown.addEventListener('mouseleave', () => {
            timeout = setTimeout(() => {
                dropdown.classList.remove('active');
            }, 100); // Small delay to allow moving to submenu
        });
        
        // Mobile touch support
        const dropdownToggle = dropdown.querySelector('a:first-child');
        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', (e) => {
                // On mobile, prevent default and toggle dropdown
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
});

// Newsletter subscription
function subscribeNewsletter(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    // Show success message
    alert('Thanks for subscribing! Check your email for your 10% off code.');
    
    // Track with analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'newsletter_signup', {
            method: 'footer_form'
        });
    }
    
    // Clear form
    event.target.reset();
}

// Product page functionality
function setupProductPage() {
    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    const mainImage = document.querySelector('.main-image img');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            if (mainImage) {
                mainImage.src = thumb.src;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            }
        });
    });
}

// Checkout form submission
function submitCheckout(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const orderData = {
        customer: {
            email: formData.get('email'),
            name: formData.get('firstName') + ' ' + formData.get('lastName'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zip: formData.get('zip')
        },
        items: cart,
        total: calculateTotal()
    };
    
    // Simulate Stripe checkout
    console.log('Processing order:', orderData);
    
    // Track conversion
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
            transaction_id: Date.now().toString(),
            value: orderData.total,
            currency: 'USD',
            items: cart.map(item => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        });
    }
    
    // Clear cart and redirect to confirmation
    localStorage.removeItem('cart');
    cart = [];
    
    // Show success message
    alert('Order placed successfully! You will receive a confirmation email shortly.');
    window.location.href = '/';
}

// Calculate total
function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    return subtotal + shipping + tax;
}

// Display order summary on checkout page
function displayOrderSummary() {
    const summaryContainer = document.getElementById('orderSummary');
    if (!summaryContainer) return;
    
    let summaryHTML = '<h3>Order Summary</h3>';
    
    cart.forEach(item => {
        summaryHTML += `
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    summaryHTML += `
        <hr>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>Shipping</span>
            <span>${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>Tax</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <hr>
        <div style="display: flex; justify-content: space-between; margin: 10px 0; font-size: 20px; font-weight: bold;">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;
    
    summaryContainer.innerHTML = summaryHTML;
}

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}