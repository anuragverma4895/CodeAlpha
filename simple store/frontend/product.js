// frontend/product.js (DEBUGGING VERSION)

document.addEventListener('DOMContentLoaded', () => {
    console.log('--- Frontend Checkpoint 1: product.js script is running.');

    const productDetailContainer = document.getElementById('product-detail-container');
    const API_URL = 'http://localhost:3000';

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    console.log(`--- Frontend Checkpoint 2: Extracted product ID from URL: "${productId}"`);

    async function fetchProductDetails() {
        if (!productId) {
            productDetailContainer.innerHTML = '<p>Error: No product ID was provided in the URL.</p>';
            return;
        }

        const fetchUrl = `${API_URL}/api/products/${productId}`;
        console.log(`--- Frontend Checkpoint 3: About to fetch from this URL: ${fetchUrl}`);

        try {
            const response = await fetch(fetchUrl);
            console.log('--- Frontend Checkpoint 4: Received a response from server.', response);

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const product = await response.json();
            console.log('--- Frontend Checkpoint 5: Parsed JSON data successfully.', product);

            displayProductDetails(product);
        } catch (error) {
            console.error('--- Frontend Checkpoint FAIL: Error fetching product details.', error);
            productDetailContainer.innerHTML = '<p style="color: red;">Could not load product details. Check console for errors.</p>';
        }
    }

    function displayProductDetails(product) {
        console.log('--- Frontend Checkpoint 6: Displaying product details.');
        // ... (rest of the function is the same, no changes needed here)
        productDetailContainer.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-detail-image"><img src="${product.imageUrl}" alt="${product.name}"></div>
                <div class="product-detail-info">
                    <h2>${product.name}</h2>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p>${product.description}</p>
                    <button data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>`;
    }

    productDetailContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const productId = event.target.dataset.productId;
            addToCart(productId);
        }
    });

    fetchProductDetails();
});