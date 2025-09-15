import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

// Home - list of posts (titles)
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).select('title slug createdAt');
    res.render('index', { title: 'Home', posts });
  } catch (err) {
    next(err);
  }
});

// View single post by slug
router.get('/post/:slug', async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).render('404', { title: 'Not Found' });
    res.render('post', { title: post.title, post });
  } catch (err) {
    next(err);
  }
});

export default router;
