// public/script.js

// --- Authentication Check ---
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}
const loggedInUserId = parseJwt(token).user.id;

// --- DOM Element Selection ---
const postsContainer = document.getElementById('postsContainer');
const postForm = document.getElementById('postForm');
const postContent = document.getElementById('postContent');
const logoutButton = document.getElementById('logoutButton');

// --- Global Event Listeners ---
document.addEventListener('DOMContentLoaded', fetchPosts);
postForm.addEventListener('submit', createPost);
logoutButton.addEventListener('click', logout);

// --- Main Functions ---

async function fetchPosts() {
    try {
        const response = await fetch('/api/posts', {
            headers: { 'x-auth-token': token }
        });

        if (response.status === 401) return logout();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const posts = await response.json();
        
        postsContainer.innerHTML = '';

        if (posts.length === 0) {
            postsContainer.innerHTML = '<div class="card"><p>Your feed is empty. Follow users on the Discover page to see their posts!</p></div>';
            return;
        }

        for (const post of posts) {
            const postCard = document.createElement('div');
            postCard.className = 'card post-card';
            postCard.id = `post-${post._id}`;

            const author = post.author ? post.author : { username: 'Anonymous' };
            const postDate = new Date(post.createdAt).toLocaleString();
            const isLiked = post.likes.includes(loggedInUserId);
            const avatarLetter = author.username.charAt(0);

            const commentsRes = await fetch(`/api/posts/${post._id}/comments`);
            const comments = await commentsRes.json();
            const commentsHTML = comments.map(comment => `
                <div class="comment">
                    <strong class="comment-author">${comment.author ? comment.author.username : 'Anonymous'}</strong>
                    <span class="comment-text">${comment.text}</span>
                </div>
            `).join('');

            postCard.innerHTML = `
                <div class="post-card-header">
                    <div class="avatar">${avatarLetter}</div>
                    <div class="author-info">
                        <h4>${author.username}</h4>
                        <div class="post-meta">${postDate}</div>
                    </div>
                </div>
                <p class="post-content">${post.content}</p>
                <div class="post-actions">
                    <button class="action-button ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
                        <i class="ph-fill ph-heart"></i>
                        <span class="like-count">${post.likes.length}</span> Likes
                    </button>
                    <button class="action-button">
                         <i class="ph ph-chat-circle"></i> ${comments.length} Comments
                    </button>
                </div>
                <div class="comments-section">
                    <div id="comments-list-${post._id}">${commentsHTML}</div>
                    <form class="comment-form" onsubmit="addComment(event, '${post._id}')">
                        <input type="text" name="commentText" placeholder="Write a comment..." required>
                        <button type="submit"><i class="ph-fill ph-paper-plane-right"></i></button>
                    </form>
                </div>
            `;
            postsContainer.appendChild(postCard);
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        postsContainer.innerHTML = '<div class="card"><p style="color: red;">Failed to load feed.</p></div>';
    }
}

async function createPost(event) {
    event.preventDefault();
    const content = postContent.value.trim();
    if (!content) {
        alert('Post content cannot be empty.');
        return;
    }
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ content }),
        });
        if (response.status === 401) return logout();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        postContent.value = '';
        fetchPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    }
}

async function toggleLike(postId) {
    try {
        const response = await fetch(`/api/posts/like/${postId}`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });
        if (response.status === 401) return logout();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const updatedLikes = await response.json();
        const postCard = document.getElementById(`post-${postId}`);
        if (postCard) {
            const likeButton = postCard.querySelector('.action-button');
            const likeCount = postCard.querySelector('.like-count');
            likeCount.textContent = updatedLikes.length;
            if (updatedLikes.includes(loggedInUserId)) {
                likeButton.classList.add('liked');
            } else {
                likeButton.classList.remove('liked');
            }
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

async function addComment(event, postId) {
    event.preventDefault();
    const commentForm = event.target;
    const commentTextInput = commentForm.querySelector('input[name="commentText"]');
    const text = commentTextInput.value.trim();
    if (!text) return;
    try {
        const res = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ text })
        });
        if (res.status === 401) return logout();
        if (!res.ok) throw new Error('Failed to post comment');
        const newComment = await res.json();
        const commentsList = document.getElementById(`comments-list-${postId}`);
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.innerHTML = `
            <strong class="comment-author">${newComment.author.username}</strong>
            <span class="comment-text">${newComment.text}</span>
        `;
        commentsList.appendChild(commentDiv);
        commentTextInput.value = '';
    } catch (err) {
        console.error('Error adding comment:', err);
        alert('Could not add comment.');
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}