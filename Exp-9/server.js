const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to the questions JSON file
const questionsFilePath = path.join(__dirname, 'questions.json');

// Helper function to read questions from the JSON file
const getQuestionsData = () => {
    try {
        const data = fs.readFileSync(questionsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading questions file:', error);
        return [];
    }
};

// API endpoint to get a list of available topics
app.get('/api/topics', (req, res) => {
    const questionsData = getQuestionsData();
    const topics = questionsData.map(quiz => quiz.topic);
    res.json({ topics });
});

// API endpoint to fetch questions for a specific topic
app.get('/api/questions/:topic', (req, res) => {
    const { topic } = req.params;
    const questionsData = getQuestionsData();
    const quiz = questionsData.find(q => q.topic.toLowerCase() === topic.toLowerCase());

    if (!quiz) {
        return res.status(404).json({ message: 'Topic not found' });
    }

    // Exclude the correct answers from the response for the frontend
    const questionsWithoutAnswers = quiz.questions.map(q => ({
        questionText: q.questionText,
        options: q.options
    }));

    res.json({ questions: questionsWithoutAnswers });
});

// API endpoint to submit answers and get the score
app.post('/api/submit', (req, res) => {
    const { topic, userAnswers } = req.body;
    const questionsData = getQuestionsData();
    const quiz = questionsData.find(q => q.topic.toLowerCase() === topic.toLowerCase());

    if (!quiz) {
        return res.status(404).json({ message: 'Topic not found' });
    }

    let score = 0;
    const results = [];

    userAnswers.forEach(userAnswer => {
        const question = quiz.questions.find(q => q.questionText === userAnswer.questionText);
        
        if (question) {
            const isCorrect = question.correctAnswer === userAnswer.selectedOption;
            if (isCorrect) {
                score++;
            }
            results.push({
                questionText: question.questionText,
                selectedOption: userAnswer.selectedOption,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect
            });
        }
    });

    res.json({
        score,
        totalQuestions: quiz.questions.length,
        results
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});