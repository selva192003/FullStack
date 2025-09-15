import express from 'express';
import basicAuth from 'express-basic-auth';
import Post from '../models/Post.js';
import crypto from 'crypto';

const router = express.Router();

const users = {};
if (process.env.ADMIN_USER && process.env.ADMIN_PASS) {
  users[process.env.ADMIN_USER] = process.env.ADMIN_PASS;
}

router.use(basicAuth({ users, challenge: true, realm: 'Admin Area' }));

// Simple in-memory messages (per-request)
router.use((req, res, next) => {
  res.locals.msg = null;
  res.locals.err = null;
  next();
});

// Simple CSRF-ish token for delete routes using env secret or random
const ACTION_TOKEN = process.env.ACTION_TOKEN || crypto.randomBytes(16).toString('hex');

// Admin dashboard - list posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('admin', { title: 'Admin', posts, token: ACTION_TOKEN });
  } catch (err) {
    next(err);
  }
});

// Create post
router.post('/create', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = new Post({ title, content });
    await post.save();
    res.redirect('/admin');
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send('A post with a similar title already exists. Please choose a different title.');
    }
    next(err);
  }
});

// Edit form
router.get('/edit/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');
    res.render('admin_edit', { title: `Edit: ${post.title}`, post });
  } catch (err) {
    next(err);
  }
});

// Update post
router.post('/edit/:id', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');
    post.title = title;
    post.content = content;
    await post.save();
    res.redirect('/admin');
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send('A post with a similar title already exists. Please choose a different title.');
    }
    next(err);
  }
});

// Delete post
router.post('/delete/:id', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (token !== ACTION_TOKEN) {
      return res.status(403).send('Invalid action token');
    }
    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

export default router;
