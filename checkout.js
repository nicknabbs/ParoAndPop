// Stripe Checkout Integration
// Using test key - replace with your live key in production
const stripe = Stripe('pk_test_51J5YQLKRigOQH5qXeUXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

async function handleCheckout() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 5.95;
    const tax = subtotal * 0.08;
    
    // Prepare line items for Stripe
    const lineItems = cart.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                images: [window.location.origin + item.image.replace('..', '')],
                metadata: {
                    product_id: item.id
                }
            },
            unit_amount: Math.round(item.price * 100) // Convert to cents
        },
        quantity: item.quantity
    }));
    
    // Add shipping as a line item if applicable
    if (shipping > 0) {
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Shipping',
                    description: 'Standard shipping (1-2 business days processing)'
                },
                unit_amount: Math.round(shipping * 100)
            },
            quantity: 1
        });
    }
    
    // Add tax as a line item
    lineItems.push({
        price_data: {
            currency: 'usd',
            product_data: {
                name: 'Sales Tax',
                description: 'Estimated tax'
            },
            unit_amount: Math.round(tax * 100)
        },
        quantity: 1
    });
    
    // For demo purposes, we'll simulate the checkout
    // In production, you would create a checkout session on your server
    try {
        // Show loading state
        const checkoutBtn = document.getElementById('stripeCheckoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = 'Processing...';
        }
        
        // Simulate API call
        setTimeout(() => {
            // For demo, we'll show a success message
            alert(`
                Stripe Checkout Demo
                
                Order Summary:
                - ${cart.length} item(s) in cart
                - Subtotal: $${subtotal.toFixed(2)}
                - Shipping: ${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}
                - Tax: $${tax.toFixed(2)}
                - Total: $${(subtotal + shipping + tax).toFixed(2)}
                
                In production, this would redirect to Stripe Checkout.
                
                To implement:
                1. Sign up for Stripe at stripe.com
                2. Get your publishable key
                3. Create a server endpoint to create checkout sessions
                4. Replace the test key in checkout.js
            `);
            
            // Clear cart after successful checkout
            if (confirm('Clear cart for demo? (In production, this happens after successful payment)')) {
                localStorage.removeItem('cart');
                updateCartCount();
                window.location.href = '/';
            }
            
            // Reset button
            if (checkoutBtn) {
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = 'Proceed to Payment';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('There was an error processing your checkout. Please try again.');
        
        // Reset button
        const checkoutBtn = document.getElementById('stripeCheckoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = 'Proceed to Payment';
        }
    }
}

// Alternative checkout for form submission
function processFormCheckout(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate form
    const required = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zip'];
    for (let field of required) {
        if (!formData.get(field)) {
            alert(`Please fill in all required fields`);
            return;
        }
    }
    
    // Process with Stripe
    handleCheckout();
}

// Initialize Stripe Elements for card input (optional)
function initializeStripeElements() {
    const elementsContainer = document.getElementById('stripe-elements');
    if (!elementsContainer) return;
    
    const elements = stripe.elements();
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': {
                    color: '#aab7c4'
                }
            }
        }
    });
    
    cardElement.mount('#stripe-elements');
    
    // Handle card validation errors
    cardElement.on('change', function(event) {
        const errorElement = document.getElementById('card-errors');
        if (event.error) {
            errorElement.textContent = event.error.message;
        } else {
            errorElement.textContent = '';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('checkout')) {
        initializeStripeElements();
    }
});