// public/auth.js
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Handle Login Form Submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to login');
            }

            const data = await res.json();
            localStorage.setItem('token', data.token); // Store token in browser's local storage
            window.location.href = '/'; // Redirect to the main feed page

        } catch (err) {
            alert(err.message);
        }
    });
}

// Handle Register Form Submission
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (!res.ok) {
                 const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to register');
            }

            alert('Registration successful! Please login.');
            window.location.href = '/login.html'; // Redirect to login page

        } catch (err) {
            alert(err.message);
        }
    });
}