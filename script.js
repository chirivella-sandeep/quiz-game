// Quiz questions with difficulty levels
const questions = {
    easy: [
        {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correct: 1
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            correct: 1
        },
        {
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correct: 2
        },
        {
            question: "What color is the sky on a clear day?",
            options: ["Green", "Blue", "Red", "Yellow"],
            correct: 1
        },
        {
            question: "How many days are in a week?",
            options: ["5", "6", "7", "8"],
            correct: 2
        },
        {
            question: "What is the opposite of hot?",
            options: ["Warm", "Cold", "Cool", "Freezing"],
            correct: 1
        }
    ],
    medium: [
        {
            question: "What is the chemical symbol for gold?",
            options: ["Ag", "Fe", "Au", "Cu"],
            correct: 2
        },
        {
            question: "Who wrote 'Romeo and Juliet'?",
            options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
            correct: 1
        },
        {
            question: "Which country is home to the kangaroo?",
            options: ["New Zealand", "South Africa", "Australia", "Brazil"],
            correct: 2
        },
        {
            question: "What is the largest ocean on Earth?",
            options: ["Atlantic", "Indian", "Arctic", "Pacific"],
            correct: 3
        },
        {
            question: "Which planet is closest to the Sun?",
            options: ["Venus", "Mercury", "Mars", "Earth"],
            correct: 1
        },
        {
            question: "What is the capital of Japan?",
            options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
            correct: 2
        }
    ],
    hard: [
        {
            question: "What is the largest mammal?",
            options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
            correct: 1
        },
        {
            question: "Which element has the chemical symbol 'O'?",
            options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
            correct: 1
        },
        {
            question: "What is the square root of 144?",
            options: ["10", "12", "14", "16"],
            correct: 1
        },
        {
            question: "Which country has the most natural lakes?",
            options: ["Canada", "Russia", "USA", "Finland"],
            correct: 0
        },
        {
            question: "What is the hardest natural substance on Earth?",
            options: ["Gold", "Diamond", "Platinum", "Titanium"],
            correct: 1
        },
        {
            question: "What is the capital of Brazil?",
            options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
            correct: 2
        }
    ]
};

// Level progression
const levelOrder = ['easy', 'medium', 'hard'];

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');
const questionEl = document.getElementById('question');
const optionsContainer = document.getElementById('options-container');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');

// Game variables
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 30;
let selectedQuestions = [];
let userAnswers = [];
let currentLevelIndex = 0;
let currentLevel = levelOrder[0];
let isGameActive = false;

// Initialize game
function init() {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }
}

// Fetch questions from Open Trivia Database
async function fetchQuestions(level) {
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=10&difficulty=${level}&type=multiple`);
        const data = await response.json();
        
        if (data.response_code === 0) {
            return data.results.map(q => ({
                question: decodeHTML(q.question),
                options: shuffleArray([...q.incorrect_answers.map(a => decodeHTML(a)), decodeHTML(q.correct_answer)]),
                correct: q.incorrect_answers.length // Index of correct answer after shuffling
            }));
        }
        throw new Error('Failed to fetch questions');
    } catch (error) {
        console.error('Error fetching questions:', error);
        // Fallback to local questions if API fails
        return getLocalQuestions(level);
    }
}

// Decode HTML entities
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Fallback local questions
function getLocalQuestions(level) {
    const questions = {
        easy: [
            {
                question: "What is 2 + 2?",
                options: ["3", "4", "5", "6"],
                correct: 1
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                correct: 1
            },
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correct: 2
            }
        ],
        medium: [
            {
                question: "What is the chemical symbol for gold?",
                options: ["Ag", "Fe", "Au", "Cu"],
                correct: 2
            },
            {
                question: "Who wrote 'Romeo and Juliet'?",
                options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
                correct: 1
            },
            {
                question: "Which country is home to the kangaroo?",
                options: ["New Zealand", "South Africa", "Australia", "Brazil"],
                correct: 2
            }
        ],
        hard: [
            {
                question: "What is the largest mammal?",
                options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
                correct: 1
            },
            {
                question: "Which element has the chemical symbol 'O'?",
                options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
                correct: 1
            },
            {
                question: "What is the square root of 144?",
                options: ["10", "12", "14", "16"],
                correct: 1
            }
        ]
    };
    return questions[level];
}

// Start the quiz
async function startQuiz() {
    isGameActive = true;
    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    
    try {
        // Show loading state
        questionEl.textContent = "Loading questions...";
        optionsContainer.innerHTML = '';
        
        // Fetch questions
        const allQuestions = await fetchQuestions(currentLevel);
        selectedQuestions = allQuestions.slice(0, 3); // Take first 3 questions
        
        currentQuestion = 0;
        score = 0;
        userAnswers = [];
        scoreEl.textContent = score;
        timeLeft = 30;
        timeEl.textContent = timeLeft;
        loadQuestion();
        startTimer();
    } catch (error) {
        console.error('Error starting quiz:', error);
        // Handle error state
        questionEl.textContent = "Error loading questions. Please try again.";
        const retryButton = document.createElement('button');
        retryButton.textContent = "Retry";
        retryButton.className = "primary-btn";
        retryButton.onclick = startQuiz;
        optionsContainer.appendChild(retryButton);
    }
}

// Load the current question
function loadQuestion() {
    const question = selectedQuestions[currentQuestion];
    questionEl.textContent = question.question;
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('div');
        button.classList.add('option');
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(index));
        optionsContainer.appendChild(button);
    });
}

// Check the selected answer
function checkAnswer(selectedIndex) {
    const question = selectedQuestions[currentQuestion];
    const options = optionsContainer.children;
    
    userAnswers.push({
        question: question.question,
        userAnswer: question.options[selectedIndex],
        correctAnswer: question.options[question.correct],
        isCorrect: selectedIndex === question.correct
    });
    
    Array.from(options).forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    if (selectedIndex === question.correct) {
        options[selectedIndex].classList.add('correct');
        score += 10;
        scoreEl.textContent = score;
    } else {
        options[selectedIndex].classList.add('wrong');
        options[question.correct].classList.add('correct');
    }
    
    clearInterval(timer);
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < selectedQuestions.length) {
            timeLeft = 30;
            timeEl.textContent = timeLeft;
            loadQuestion();
            startTimer();
        } else {
            endQuiz();
        }
    }, 1500);
}

// Start the timer
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            const question = selectedQuestions[currentQuestion];
            userAnswers.push({
                question: question.question,
                userAnswer: "Time's up!",
                correctAnswer: question.options[question.correct],
                isCorrect: false
            });
            
            currentQuestion++;
            if (currentQuestion < selectedQuestions.length) {
                timeLeft = 30;
                timeEl.textContent = timeLeft;
                loadQuestion();
                startTimer();
            } else {
                endQuiz();
            }
        }
    }, 1000);
}

// End the quiz
function endQuiz() {
    clearInterval(timer);
    quizScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    const endScreenContent = document.createElement('div');
    endScreenContent.className = 'results-page';
    endScreenContent.innerHTML = `
        <div class="results-header">
            <h2>Level ${currentLevel.toUpperCase()} Results</h2>
            <div class="level-badge">Level ${currentLevel.toUpperCase()}</div>
        </div>

        <div class="results-grid">
            <div class="main-stats">
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">${score}</div>
                    <div class="stat-label">Score</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value">${30 - timeLeft}s</div>
                    <div class="stat-label">Time Used</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✓</div>
                    <div class="stat-value">${userAnswers.filter(a => a.isCorrect).length}/${userAnswers.length}</div>
                    <div class="stat-label">Correct Answers</div>
                </div>
            </div>

            <div class="detailed-results">
                <h3>Question Analysis</h3>
                <div class="questions-list">
                    ${userAnswers.map((answer, index) => `
                        <div class="question-card ${answer.isCorrect ? 'correct' : 'incorrect'}">
                            <div class="question-header">
                                <span class="question-number">Q${index + 1}</span>
                                <span class="question-status">${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                            </div>
                            <div class="question-content">
                                <p class="question-text">${answer.question}</p>
                                <div class="answer-details">
                                    <p>Your answer: <span class="${answer.isCorrect ? 'correct-text' : 'wrong-text'}">${answer.userAnswer}</span></p>
                                    <p>Correct answer: <span class="correct-text">${answer.correctAnswer}</span></p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="results-footer">
            ${score >= 20 ? `
                <button id="next-level-btn" class="primary-btn">Continue to Next Level</button>
            ` : `
                <button id="restart-btn" class="primary-btn">Try Again</button>
            `}
        </div>
    `;

    endScreen.innerHTML = '';
    endScreen.appendChild(endScreenContent);

    // Add event listeners for buttons
    const nextLevelBtn = document.getElementById('next-level-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
            if (currentLevelIndex < levelOrder.length - 1) {
                currentLevelIndex++;
                currentLevel = levelOrder[currentLevelIndex];
                endScreen.classList.add('hidden');
                startQuiz();
            } else {
                showFinalResults();
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            endScreen.classList.add('hidden');
            startQuiz();
        });
    }
}

// Show final results
function showFinalResults() {
    const endScreenContent = document.createElement('div');
    endScreenContent.className = 'results-page final-results';
    endScreenContent.innerHTML = `
        <div class="results-header">
            <h2>Game Complete!</h2>
            <div class="level-badge">Level Master</div>
        </div>

        <div class="level-master-celebration">
            <div class="achievement-icon">👑</div>
            <h3>Congratulations!</h3>
            <p>You've completed all levels!</p>
        </div>

        <div class="results-footer">
            <button id="restart-btn" class="primary-btn">Play Again</button>
        </div>
    `;

    endScreen.innerHTML = '';
    endScreen.appendChild(endScreenContent);

    // Add event listener for the Play Again button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            // Reset game state
            currentQuestion = 0;
            score = 0;
            timeLeft = 30;
            currentLevelIndex = 0;
            currentLevel = levelOrder[0];
            isGameActive = false;
            userAnswers = [];
            selectedQuestions = [];
            
            // Return to start screen
            endScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
        });
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 