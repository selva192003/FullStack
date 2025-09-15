# Online MCQ Quiz App

An online MCQ quiz with topics, powered by a Node.js backend and a static frontend.

## Features
- Topics fetched from `/api/topics`
- Questions fetched from `/api/questions/:topic` (answers hidden)
- Submit answers to `/api/submit` to get score and per-question correctness
- Neatly styled results page

## Run (Windows PowerShell)

1. Install dependencies and start the API server

```powershell
cd c:\Users\Student\FullStack\Exp-9
npm install
npm start
```

Keep this running; it serves the API at http://localhost:3000.

2. Open the frontend
- Double-click `index.html` to open it in your browser; or
- Use the VS Code Live Server extension: Right-click `index.html` > Open with Live Server

The frontend expects `http://localhost:3000` (set in `app.js` via `API_URL`). If you change the port, update `API_URL` or set the `PORT` env var and keep it in sync.

## API quick test (optional)

```powershell
# List topics
Invoke-RestMethod -Uri "http://localhost:3000/api/topics" -Method GET | ConvertTo-Json -Depth 5

# Fetch questions for JavaScript
Invoke-RestMethod -Uri "http://localhost:3000/api/questions/JavaScript" -Method GET | ConvertTo-Json -Depth 5
```

## Files
- `server.js` - Express API server
- `questions.json` - Quiz data storage
- `index.html` - Frontend UI
- `app.js` - Frontend logic
- `style.css` - Styling
