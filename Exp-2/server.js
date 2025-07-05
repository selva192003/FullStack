// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
let formData = {};

// For express-handlebars v7+ without layouts
const { engine } = require('express-handlebars');
app.engine('hbs', engine({
  extname: '.hbs',
  layoutsDir: false,
  helpers: {
    capitalize: str => str.charAt(0).toUpperCase() + str.slice(1)
  }
}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  formData = {};
  res.render('form1', { layout: false });
});

app.post('/form2', (req, res) => {
  formData = { ...formData, ...req.body };
  res.render('form2', { layout: false });
});

app.post('/form3', (req, res) => {
  formData = { ...formData, ...req.body };
  res.render('form3', { layout: false });
});

app.post('/submit', (req, res) => {
  formData = { ...formData, ...req.body };

  const totalSubjects = [
    parseFloat(formData.java) || 0,
    parseFloat(formData.mobile) || 0,
    parseFloat(formData.cloud) || 0,
    parseFloat(formData.ml) || 0,
    parseFloat(formData.python) || 0,
    parseFloat(formData.javaLab) || 0,
    parseFloat(formData.mobileLab) || 0,
    parseFloat(formData.cloudLab) || 0,
    parseFloat(formData.mlLab) || 0,
    parseFloat(formData.pythonLab) || 0
  ];

  const totalCredits = 10;
  const totalMarks = totalSubjects.reduce((sum, val) => sum + val, 0);
  const cgpa = (totalMarks / (totalCredits * 10)).toFixed(2);

  const finalData = { ...formData, cgpa };
  fs.writeFileSync('data.json', JSON.stringify(finalData, null, 2));
  res.redirect('/result');
});

app.get('/result', (req, res) => {
  const data = JSON.parse(fs.readFileSync('data.json'));
  res.render('result', { ...data, layout: false });
});

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
