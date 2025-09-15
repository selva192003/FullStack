const API_URL = 'http://localhost:3000/api';

const topicSelectionContainer = document.getElementById('topic-selection-container');
const topicsList = document.getElementById('topics-list');
const quizContainer = document.getElementById('quiz-container');
const quizTopicEl = document.getElementById('quiz-topic');
const progressBar = document.getElementById('progress-bar');
const questionTextEl = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const resultsContainer = document.getElementById('results-container');
const scoreDisplay = document.getElementById('score-display');
const resultsDetails = document.getElementById('results-details');
const resultsSummary = document.getElementById('results-summary');
const restartBtn = document.getElementById('restart-btn');

let currentTopic = '';
let questions = [];
let userAnswers = [];
let currentQuestionIndex = 0;

// Smooth scroll for Start Now button
const ctaBtn = document.querySelector('.cta-btn');
if (ctaBtn) {
    ctaBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const topicsSection = document.getElementById('topic-selection-container');
        if (topicsSection) {
            topicsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                const firstTopicBtn = document.querySelector('.topic-button');
                if (firstTopicBtn) firstTopicBtn.focus();
            }, 600);
        }
    });
}

// Enhance topic buttons for accessibility and modern effect
function enhanceTopicButtons() {
    const topicBtns = document.querySelectorAll('.topic-button');
    topicBtns.forEach(btn => {
        btn.setAttribute('tabindex', '0');
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
        btn.addEventListener('mousedown', function() {
            btn.classList.add('active');
        });
        btn.addEventListener('mouseup', function() {
            btn.classList.remove('active');
        });
        btn.addEventListener('mouseleave', function() {
            btn.classList.remove('active');
        });
    });
}

// Function to fetch and display topics
const fetchTopics = async () => {
    try {
        const response = await fetch(`${API_URL}/topics`);
        const data = await response.json();
        
        topicsList.innerHTML = ''; // Clear previous topics
        data.topics.forEach(topic => {
            const button = document.createElement('button');
            button.className = 'topic-button';
            button.textContent = topic;
            button.addEventListener('click', () => startQuiz(topic));
            topicsList.appendChild(button);
        });
        
        topicSelectionContainer.classList.add('active');
        enhanceTopicButtons();
    } catch (error) {
        console.error('Error fetching topics:', error);
        topicsList.innerHTML = '<p>Could not load topics. Please check the server connection.</p>';
    }
};

const startQuiz = async (topic) => {
    currentTopic = topic;
    currentQuestionIndex = 0;
    userAnswers = [];
    try {
        const response = await fetch(`${API_URL}/questions/${topic}`);
        const data = await response.json();
        questions = data.questions;
        topicSelectionContainer.classList.remove('active');
        quizContainer.classList.add('active');
        quizTopicEl.textContent = `Topic: ${topic}`;
        displayQuestion();
        updateNavigationButtons();
        updateProgressBar();
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to load quiz. Please try again.');
        location.reload();
    }
};

const displayQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    questionTextEl.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.questionText}`;
    optionsList.innerHTML = '';
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => selectOption(option, button));
        const savedAnswer = userAnswers.find(ua => ua.questionText === currentQuestion.questionText);
        if (savedAnswer && savedAnswer.selectedOption === option) {
            button.classList.add('selected');
        }
        optionsList.appendChild(button);
    });
    updateNavigationButtons();
    updateProgressBar();
};

// Progress bar logic
function updateProgressBar() {
    if (!progressBar || !questions.length) return;
    const percent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
    progressBar.style.width = `${percent}%`;
}

// Function to handle option selection
const selectOption = (selectedOption, buttonEl) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Deselect all other options
    Array.from(optionsList.children).forEach(btn => {
        btn.classList.remove('selected');
    });

    // Add selected class to the chosen option button
    if (buttonEl) {
        buttonEl.classList.add('selected');
    }
    
    // Save the user's answer
    const existingAnswerIndex = userAnswers.findIndex(ua => ua.questionText === currentQuestion.questionText);
    
    if (existingAnswerIndex !== -1) {
        userAnswers[existingAnswerIndex].selectedOption = selectedOption;
    } else {
        userAnswers.push({
            questionText: currentQuestion.questionText,
            selectedOption: selectedOption
        });
    }
};

// Function to update visibility of navigation buttons
const updateNavigationButtons = () => {
    prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    nextBtn.style.display = currentQuestionIndex < questions.length - 1 ? 'block' : 'none';
    submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'block' : 'none';
};

// Navigation button handlers
nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
});

// Function to submit the quiz
submitBtn.addEventListener('click', async () => {
    // Check if all questions are answered
    if (userAnswers.length !== questions.length) {
        alert('Please answer all questions before submitting!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: currentTopic,
                userAnswers
            })
        });
        
        const result = await response.json();
        displayResults(result);
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Failed to submit quiz. Please try again.');
    }
});

// Function to display the quiz results
const displayResults = (result) => {
    quizContainer.classList.remove('active');
    resultsContainer.classList.add('active');

    scoreDisplay.textContent = `Your Score: ${result.score} / ${result.totalQuestions}`;

    // Add summary with emoji and feedback
    let feedback = '';
    const percent = Math.round((result.score / result.totalQuestions) * 100);
    if (percent === 100) feedback = '🏆 Perfect! You nailed it!';
    else if (percent >= 80) feedback = '🎉 Great job!';
    else if (percent >= 50) feedback = '👍 Good effort!';
    else feedback = '💡 Keep practicing!';
    resultsSummary.textContent = `You answered ${result.score} out of ${result.totalQuestions} correctly. ${feedback}`;

    resultsDetails.innerHTML = '';
    result.results.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        const questionP = document.createElement('p');
        questionP.textContent = `Question: ${item.questionText}`;

        const userAnswerP = document.createElement('p');
        userAnswerP.textContent = `Your Answer: ${item.selectedOption || 'Not answered'}`;

        const correctAnswerP = document.createElement('p');
        correctAnswerP.textContent = `Correct Answer: ${item.correctAnswer}`;

        if (item.isCorrect) {
            userAnswerP.classList.add('correct');
        } else {
            userAnswerP.classList.add('incorrect');
            correctAnswerP.classList.add('correct');
        }

        resultItem.appendChild(questionP);
        resultItem.appendChild(userAnswerP);
        resultItem.appendChild(correctAnswerP);
        resultsDetails.appendChild(resultItem);
    });
};

// Restart button handler
restartBtn.addEventListener('click', () => {
    resultsContainer.classList.remove('active');
    fetchTopics(); // Go back to topic selection
});

// Initial function call to load topics when the page loads
fetchTopics();