document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const registerMessage = document.getElementById('register-message');
    const loginMessage = document.getElementById('login-message');
    const API_URL = 'http://localhost:3000';

    // --- REGISTER FORM SUBMISSION ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from reloading the page
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                registerMessage.textContent = result.message;
                registerMessage.className = 'message success';
            } else {
                registerMessage.textContent = result.message;
                registerMessage.className = 'message error';
            }
        } catch (error) {
            registerMessage.textContent = 'Could not connect to server.';
            registerMessage.className = 'message error';
        }
    });

    // --- LOGIN FORM SUBMISSION ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                loginMessage.textContent = result.message;
                loginMessage.className = 'message success';
                
                // Save user info to sessionStorage (clears when browser tab is closed)
                sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
                
                // Redirect to the home page after a successful login
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000); // Wait 1 second before redirecting

            } else {
                loginMessage.textContent = result.message;
                loginMessage.className = 'message error';
            }
        } catch (error) {
            loginMessage.textContent = 'Could not connect to server.';
            loginMessage.className = 'message error';
        }
    });
});