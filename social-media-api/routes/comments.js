// routes/comments.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: mergeParams allows us to get postId
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// GET all comments for a specific post
// GET /api/posts/:postId/comments
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'username')
            .sort({ createdAt: 'asc' });
        res.json(comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST a new comment on a specific post
// POST /api/posts/:postId/comments
router.post('/', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const newComment = new Comment({
            text: req.body.text,
            author: req.user.id,
            post: req.params.postId
        });

        const comment = await newComment.save();
        // Populate author info before sending back
        const populatedComment = await Comment.findById(comment._id).populate('author', 'username');
        res.status(201).json(populatedComment);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;