// A set of reusable functions to manage the shopping cart stored in localStorage.

const API_URL = 'http://localhost:3000';

// Function to get the cart from localStorage
function getCart() {
    // localStorage stores strings, so we need to parse it back into an array
    const cartString = localStorage.getItem('shoppingCart');
    return JSON.parse(cartString) || []; // Return an empty array if the cart is not found
}

// Function to save the cart to localStorage
function saveCart(cart) {
    // We must stringify the array before saving it to localStorage
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartIcon(); // Update the icon every time we save
}

// NEW FUNCTION to show the toast notification
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return; // Safety check

    toast.textContent = message;
    toast.classList.add('show');

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- MODIFY THE addToCart FUNCTION ---
function addToCart(productId) {
    const cart = getCart();
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    saveCart(cart);
    // REMOVE THE OLD ALERT
    // alert('Product added to cart!');
    
    // USE THE NEW TOAST INSTEAD
    showToast('Product added to cart!');
}

// Function to update the cart count in the header
function updateCartIcon() {
    const cart = getCart();
    // Calculate total quantity of items, not just the number of unique items
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// NEW FUNCTION: To remove an item completely from the cart
function removeFromCart(productId) {
    let cart = getCart();
    // Filter out the item that matches the productId
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

// NEW FUNCTION: To change the quantity of an item
function updateQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (newQuantity > 0) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            // If quantity is 0 or less, remove the item
            cart = cart.filter(item => item.id !== productId);
        }
        saveCart(cart);
    }
}

// Make sure the cart icon is updated as soon as any page loads
document.addEventListener('DOMContentLoaded', updateCartIcon);