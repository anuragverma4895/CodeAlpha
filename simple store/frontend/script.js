document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    // Ensure this URL is correct
    const API_URL = 'http://localhost:3000';

    async function fetchProducts() {
        try {
            // This is the network request that seems to be failing
            const response = await fetch(`${API_URL}/api/products`);
            
            // If the code reaches here, a connection was made.
            if (!response.ok) {
                // This handles errors from the server, like 404 Not Found
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const products = await response.json();
            displayProducts(products);

        } catch (error) {
            // This handles network errors, like the server being offline
            console.error('Error fetching products:', error);
            productList.innerHTML = '<p style="color: red; font-weight: bold;">Could not load products. Please ensure the backend server is running and accessible.</p>';
        }
    }

    function displayProducts(products) {
        if (!products || products.length === 0) {
            productList.innerHTML = '<p>No products were found.</p>';
            return;
        }

        productList.innerHTML = ''; // Clear the 'Loading...' message
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p>${product.description}</p>
                </a>
                <button data-product-id="${product.id}">Add to Cart</button>
            `;
            productList.appendChild(productCard);
        });
    }

    // Add to cart listener
    productList.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const productId = event.target.dataset.productId;
            addToCart(productId); // This function is from cart-logic.js
        }
    });

    // Start the process
    fetchProducts();
});