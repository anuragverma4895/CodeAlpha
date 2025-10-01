// routes/posts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
// NOTE: We no longer need to require the 'User' model in this file.


// GET: Retrieve GLOBAL feed (all posts from all users)
// This route is now public again to simplify fetching.
router.get('/', async (req, res) => {
  try {
    // The query is changed back to a simple .find() to get ALL posts.
    const posts = await Post.find()
        .populate('author', 'username') // Still populate author info
        .sort({ createdAt: -1 });      // Still sort by newest first
        
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});


// POST: Create a new post (This remains protected)
router.post('/', auth, async (req, res) => {
  const post = new Post({
    content: req.body.content,
    author: req.user.id,
  });
  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// PUT: Like/Unlike a post (This remains protected)
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.some(like => like.equals(req.user.id))) {
            post.likes.push(req.user.id);
        } else {
            post.likes = post.likes.filter(like => !like.equals(req.user.id));
        }
        await post.save();
        return res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Re-route to comment router (This remains the same)
router.use('/:postId/comments', require('./comments'));


module.exports = router;