// public/discover.js
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

const usersContainer = document.getElementById('usersContainer');
const logoutButton = document.getElementById('logoutButton');

let currentUserFollowing = [];

async function fetchCurrentUser() {
    try {
        const res = await fetch('/api/users/me', {
            headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error('Failed to fetch current user');
        const user = await res.json();
        currentUserFollowing = user.following || [];
    } catch (err) {
        console.error(err);
    }
}

async function fetchAndDisplayUsers() {
    await fetchCurrentUser(); 

    try {
        const res = await fetch('/api/users', {
            headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const users = await res.json();

        usersContainer.innerHTML = '';

        if (users.length === 0) {
            usersContainer.innerHTML = '<p>No other users to show yet.</p>';
            return;
        }

        users.forEach(user => {
            const isFollowing = currentUserFollowing.includes(user._id);
            const avatarLetter = user.username.charAt(0);

            const userCard = document.createElement('div');
            userCard.className = 'card user-card';
            userCard.innerHTML = `
                <div class="user-info">
                    <div class="avatar">${avatarLetter}</div>
                    <h4>${user.username}</h4>
                </div>
                <button class="follow-button ${isFollowing ? 'following' : ''}" onclick="toggleFollow('${user._id}')">
                    ${isFollowing ? 'Following' : 'Follow'}
                </button>
            `;
            usersContainer.appendChild(userCard);
        });
    } catch (err) {
        console.error(err);
        usersContainer.innerHTML = '<div class="card"><p style="color: red;">Could not load users.</p></div>';
    }
}

async function toggleFollow(userId) {
    try {
        const res = await fetch(`/api/users/follow/${userId}`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error('Action failed');
        await fetchAndDisplayUsers();
    } catch (err) {
        console.error('Error toggling follow:', err);
        alert('An error occurred.');
    }
}

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});

fetchAndDisplayUsers();