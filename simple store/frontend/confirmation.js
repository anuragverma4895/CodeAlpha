// frontend/confirmation.js (CORRECTED VERSION)

document.addEventListener('DOMContentLoaded', async () => {
    const confirmationContainer = document.getElementById('confirmation-container');
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    const API_URL = 'http://localhost:3000'; // Make sure this is defined

    if (!orderId) {
        confirmationContainer.innerHTML = '<h2>Error: No Order ID found.</h2>';
        return;
    }

    try {
        // THIS IS THE CORRECTED FETCH URL
        const response = await fetch(`${API_URL}/api/orders/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Could not find your order details.');
        }

        const order = await response.json();

        // Build the confirmation message
        let itemsHtml = order.Products.map(product => `
            <li>
                ${product.name} - 
                Quantity: ${product.OrderItem.quantity} x 
                $${parseFloat(product.OrderItem.price).toFixed(2)}
            </li>
        `).join('');

        confirmationContainer.innerHTML = `
            <div class="confirmation-box">
                <h2>Thank You For Your Order!</h2>
                <p>Your order has been placed successfully.</p>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Order Placed For:</strong> ${order.User.username}</p>
                <p><strong>Order Total:</strong> $${parseFloat(order.totalPrice).toFixed(2)}</p>
                <h3>Items Purchased:</h3>
                <ul>${itemsHtml}</ul>
                <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
            </div>
        `;

    } catch (error) {
        confirmationContainer.innerHTML = `<h2>Error: ${error.message}</h2><p>Please check the order ID or contact support.</p>`;
    }
});