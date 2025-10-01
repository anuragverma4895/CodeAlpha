// frontend/shared.js
document.addEventListener('DOMContentLoaded', () => {
    const userStatusDiv = document.getElementById('user-status');
    const loggedInUserString = sessionStorage.getItem('loggedInUser');

    if (loggedInUserString) {
        const loggedInUser = JSON.parse(loggedInUserString);
        userStatusDiv.innerHTML = `
            <span style="color: white;">Welcome, ${loggedInUser.username}!</span>
            <button id="logout-btn" style="margin-left: 10px;">Logout</button>
        `;

        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('loggedInUser'); // Clear the session
            window.location.href = 'index.html'; // Redirect to home
        });
    } else {
        userStatusDiv.innerHTML = '<a href="login.html" style="color: white;">Login</a>';
    }
});