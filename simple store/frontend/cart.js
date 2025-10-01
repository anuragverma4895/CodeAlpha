// frontend/cart.js (FINAL, CORRECTED VERSION)

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const API_URL = 'http://localhost:3000';

    // --- FUNCTION TO DISPLAY CART ITEMS ---
    async function displayCartItems() {
        const cart = getCart(); // From cart-logic.js

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            totalPriceElement.textContent = '0.00';
            checkoutBtn.disabled = true;
            checkoutBtn.style.backgroundColor = '#aaa';
            return;
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.style.backgroundColor = '#007bff';
        }

        let totalPrice = 0;
        cartItemsContainer.innerHTML = 'Loading...'; // Placeholder

        const itemPromises = cart.map(async (item) => {
            try {
                // This fetches PRODUCT details, which is correct for this page
                const response = await fetch(`${API_URL}/api/products/${item.id}`);
                if (!response.ok) throw new Error('Product not found');
                const product = await response.json();

                const itemTotal = product.price * item.quantity;
                totalPrice += itemTotal;

                return `
                    <div class="cart-item">
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <div class="cart-item-info">
                            <h4>${product.name}</h4>
                            <p>$${product.price.toFixed(2)} each</p>
                            <button class="remove-btn" data-product-id="${item.id}">Remove</button>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" data-action="increase" data-product-id="${item.id}">+</button>
                        </div>
                        <div class="cart-item-total"><p>$${itemTotal.toFixed(2)}</p></div>
                    </div>
                `;
            } catch (error) {
                return `<div class="cart-item"><p>Could not load item details for ID ${item.id}.</p></div>`;
            }
        });

        const itemHtmlElements = await Promise.all(itemPromises);
        cartItemsContainer.innerHTML = itemHtmlElements.join('');
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }

    // --- EVENT LISTENER FOR CART CONTROLS (QUANTITY/REMOVE) ---
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.dataset.productId;
        if (!productId) return;

        if (target.classList.contains('quantity-btn')) {
            const action = target.dataset.action;
            const item = getCart().find(cartItem => cartItem.id === productId);
            if (action === 'increase') {
                updateQuantity(productId, item.quantity + 1);
            } else if (action === 'decrease') {
                updateQuantity(productId, item.quantity - 1);
            }
        } else if (target.classList.contains('remove-btn')) {
            removeFromCart(productId);
        }

        displayCartItems();
        updateCartIcon();
    });

    // --- EVENT LISTENER FOR CHECKOUT BUTTON ---
    checkoutBtn.addEventListener('click', async () => {
        const loggedInUserString = sessionStorage.getItem('loggedInUser');
        if (!loggedInUserString) {
            alert('You must be logged in to proceed to checkout.');
            window.location.href = 'login.html';
            return;
        }

        const user = JSON.parse(loggedInUserString);
        const cart = getCart();
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        try {
            checkoutBtn.textContent = 'Processing...';
            checkoutBtn.disabled = true;

            // This correctly makes a POST request to /api/orders
            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, cart: cart })
            });

            const result = await response.json();

            if (response.ok) {
                const orderId = result.orderId;
                saveCart([]);
                updateCartIcon();
                // This correctly redirects to the confirmation page
                window.location.href = `confirmation.html?orderId=${orderId}`;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert(`Failed to place order: ${error.message}`);
            checkoutBtn.textContent = 'Proceed to Checkout';
            checkoutBtn.disabled = false;
        }
    });

    // --- INITIALIZE PAGE ---
    displayCartItems();
});