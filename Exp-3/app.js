const express = require('express');
const bodyParser = require('body-parser');
const Student = require('./models/Student');
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://selvaj:selva%40192003@cluster0.u7ykafm.mongodb.net/studentDB?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Home - list all students
app.get('/', async (req, res) => {
  const students = await Student.find();
  res.render('index', { students });
});

// Render new student form
app.get('/add', (req, res) => {
  res.render('form');
});

// Handle student creation
app.post('/add', async (req, res) => {
  const { name, rollNumber, department } = req.body;
  await Student.create({ name, rollNumber, department });
  res.redirect('/');
});

// Render edit form
app.get('/edit/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  res.render('edit', { student });
});

// Handle student update
app.post('/edit/:id', async (req, res) => {
  const { name, rollNumber, department } = req.body;
  await Student.findByIdAndUpdate(req.params.id, { name, rollNumber, department });
  res.redirect('/');
});

// Delete student
app.get('/delete/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
