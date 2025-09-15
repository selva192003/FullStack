const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

console.log('1. Server script started.'); // Added log

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'todos.json');

console.log('2. Constants defined.'); // Added log

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

console.log('3. Middleware configured.'); // Added log

// CORS - Optional, but good for local development if you run client/server on different ports
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

console.log('4. CORS configured.'); // Added log

// Helper function to read todos from the file
function readTodosFromFile() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('todos.json not found, initializing with empty array.');
            return [];
        }
        console.error('Error reading todos file:', error); // Important: This logs the actual error
        return [];
    }
}

// Helper function to write todos to the file
function writeTodosToFile(todos) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing todos file:', error); // Important: This logs the actual error
    }
}

console.log('5. Helper functions defined.'); // Added log

// API Endpoints
app.get('/api/todos', (req, res) => {
    const todos = readTodosFromFile();
    res.json(todos);
});

app.post('/api/todos', (req, res) => {
    const newTodo = req.body;
    if (!newTodo || typeof newTodo.text !== 'string' || newTodo.text.trim() === '') {
        return res.status(400).json({ message: 'Todo text is required.' });
    }

    const todos = readTodosFromFile();
    newTodo.id = Date.now().toString();
    newTodo.completed = false;
    todos.push(newTodo);
    writeTodosToFile(todos);
    res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
    const todoId = req.params.id;
    const updatedTodoData = req.body;
    let todos = readTodosFromFile();

    const index = todos.findIndex(todo => todo.id === todoId);

    if (index !== -1) {
        todos[index] = { ...todos[index], ...updatedTodoData };
        writeTodosToFile(todos);
        res.json(todos[index]);
    } else {
        res.status(404).json({ message: 'Todo not found.' });
    }
});

app.delete('/api/todos/:id', (req, res) => {
    const todoId = req.params.id;
    let todos = readTodosFromFile();

    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== todoId);

    if (todos.length < initialLength) {
        writeTodosToFile(todos);
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Todo not found.' });
    }
});

console.log('6. API Endpoints defined.'); // Added log

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

console.log('7. App listen call made.'); // Added log

// Ensure the data directory exists
try { // Added try-catch for directory creation
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'));
        console.log('Data directory created.'); // Added log
    }
} catch (err) {
    console.error('Error creating data directory:', err); // Log error
}


// Initialize todos.json if it doesn't exist
try { // Added try-catch for file initialization
    if (!fs.existsSync(DATA_FILE)) {
        writeTodosToFile([]);
        console.log('todos.json initialized with empty array.'); // Added log
    }
} catch (err) {
    console.error('Error initializing todos.json:', err); // Log error
}

console.log('8. Directory and file checks performed.'); // Added log
// ... (rest of your server.js code) ...

// PUT /api/todos/:id - Update a todo (e.g., toggle completed or update text)
app.put('/api/todos/:id', (req, res) => {
    const todoId = req.params.id;
    const updatedTodoData = req.body; // This will contain { completed: true } OR { text: 'new text' }
    let todos = readTodosFromFile();

    const index = todos.findIndex(todo => todo.id === todoId);

    if (index !== -1) {
        // Merge existing todo with new data. This handles both 'completed' and 'text' updates.
        todos[index] = { ...todos[index], ...updatedTodoData };
        writeTodosToFile(todos);
        res.json(todos[index]); // Send back the updated todo
    } else {
        res.status(404).json({ message: 'Todo not found.' });
    }
});

// ... (rest of your server.js code) ...