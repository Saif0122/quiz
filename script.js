"use client"

// Application State
let currentTopic = ""
let currentDifficulty = ""
let currentMode = "practice"
let questionCount = 10
let currentQuestions = []
let currentQuestionIndex = 0
let score = 0
let selectedAnswer = null
let startTime = 0
let quizTimer = null
let elapsedTime = 0
let userAnswers = []
let difficultyStats = {
  basic: { correct: 0, total: 0 },
  intermediate: { correct: 0, total: 0 },
  advanced: { correct: 0, total: 0 },
}

// DOM Elements
const screens = {
  landing: document.getElementById("landing"),
  config: document.getElementById("config"),
  quiz: document.getElementById("quiz"),
  results: document.getElementById("results"),
  stats: document.getElementById("stats"),
  achievements: document.getElementById("achievements"),
}

const elements = {
  topicCards: document.querySelectorAll(".topic-card"),
  backToHome: document.getElementById("backToHome"),
  configTopicIcon: document.getElementById("configTopicIcon"),
  configTopicName: document.getElementById("configTopicName"),
  difficultyOptions: document.querySelectorAll(".difficulty-option"),
  countOptions: document.querySelectorAll(".count-option"),
  modeOptions: document.querySelectorAll(".mode-option"),
  startConfiguredQuiz: document.getElementById("startConfiguredQuiz"),
  questionText: document.getElementById("questionText"),
  optionsContainer: document.getElementById("optionsContainer"),
  nextBtn: document.getElementById("nextBtn"),
  hintBtn: document.getElementById("hintBtn"),
  questionHint: document.getElementById("questionHint"),
  progressFill: document.querySelector(".progress-fill"),
  currentQ: document.getElementById("currentQ"),
  totalQ: document.getElementById("totalQ"),
  currentTopic: document.getElementById("currentTopic"),
  currentDifficulty: document.getElementById("currentDifficulty"),
  questionDifficulty: document.getElementById("questionDifficulty"),
  questionType: document.getElementById("questionType"),
  timeDisplay: document.getElementById("timeDisplay"),
  quitQuiz: document.getElementById("quitQuiz"),
  retryBtn: document.getElementById("retryBtn"),
  homeBtn: document.getElementById("homeBtn"),
  reviewBtn: document.getElementById("reviewBtn"),
}

// Topic Configuration
const topicConfig = {
  html: { icon: "🏗️", name: "HTML", description: "Structure & Semantics" },
  css: { icon: "🎨", name: "CSS", description: "Styling & Layout" },
  javascript: { icon: "⚡", name: "JavaScript", description: "Logic & Interactivity" },
  react: { icon: "⚛️", name: "React", description: "Component Library" },
  nextjs: { icon: "▲", name: "Next.js", description: "React Framework" },
  npm: { icon: "📦", name: "NPM", description: "Package Management" },
}

// Quiz Data
const quizData = {
  html: [
    {
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language"],
      correct: 0,
      difficulty: "basic",
      type: "multiple-choice",
    },
    {
      question: "Which HTML tag is used to define an internal style sheet?",
      options: ["&lt;style&gt;", "&lt;script&gt;", "&lt;link&gt;"],
      correct: 0,
      difficulty: "intermediate",
      type: "multiple-choice",
    },
  ],
  css: [
    {
      question: "What does CSS stand for?",
      options: ["Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
      correct: 0,
      difficulty: "basic",
      type: "multiple-choice",
    },
    {
      question: "Which CSS property is used to change the text color of an element?",
      options: ["color", "text-color", "font-color"],
      correct: 0,
      difficulty: "intermediate",
      type: "multiple-choice",
    },
  ],
  javascript: [
    {
      question: "What does JavaScript stand for?",
      options: ["Java Script", "JavaScript", "JScript"],
      correct: 1,
      difficulty: "basic",
      type: "multiple-choice",
    },
    {
      question: "Which method is used to add a new element at the end of an array?",
      options: ["push()", "append()", "add()"],
      correct: 0,
      difficulty: "intermediate",
      type: "multiple-choice",
    },
  ],
  react: [
    {
      question: "What is React?",
      options: ["A JavaScript library for building user interfaces", "A web server", "A database"],
      correct: 0,
      difficulty: "basic",
      type: "multiple-choice",
    },
    {
      question: "Which hook is used for state management in functional components?",
      options: ["useState()", "useEffect()", "useContext()"],
      correct: 0,
      difficulty: "intermediate",
      type: "multiple-choice",
    },
  ],
  nextjs: [
    {
      question: "What is Next.js?",
      options: [
        "A React framework for server-side rendering and generating static websites",
        "A CSS framework",
        "A JavaScript game engine",
      ],
      correct: 0,
      difficulty: "basic",
      type: "multiple-choice",
    },
    {
      question: "Which feature of Next.js allows you to fetch data on the server side?",
      options: ["getServerSideProps()", "getStaticProps()", "useEffect()"],
      correct: 0,
      difficulty: "intermediate",
      type: "multiple-choice",
    },
  ],
  npm: [
    {
      question: "What does NPM stand for?",
      options: ["Node Package Manager", "Network Package Manager", "New Package Manager"],
      correct: 0,
      difficulty: "basic",
      type: "multiple-choice",
    },
    {
      question: "Which command is used to install a package globally?",
      options: ["npm install -g", "npm install --global", "npm global install"],
      correct: 0,
      difficulty: "intermediate",
      type: "multiple-choice",
    },
  ],
}

// Event Listeners
document.addEventListener("DOMContentLoaded", initializeApp)

// Navigation
// Navigation - Topic Cards and Start Learning Buttons
elements.topicCards.forEach((card) => {
  // Make entire card clickable
  card.addEventListener("click", (e) => {
    // Prevent double triggering when clicking the button
    if (!e.target.closest(".start-learning-btn")) {
      selectTopic(card)
    }
  })
})

// Start Learning Button Event Listeners
document.querySelectorAll(".start-learning-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation() // Prevent card click
    const topic = btn.dataset.topic
    const card = btn.closest(".topic-card")
    selectTopicAndStart(card, topic)
  })
})

elements.backToHome.addEventListener("click", () => showScreen("landing"))
elements.quitQuiz.addEventListener("click", () => showScreen("landing"))
elements.homeBtn.addEventListener("click", () => showScreen("landing"))

// Configuration
elements.difficultyOptions.forEach((option) => {
  option.addEventListener("click", () => selectDifficulty(option))
})

elements.countOptions.forEach((option) => {
  option.addEventListener("click", () => selectQuestionCount(option))
})

elements.modeOptions.forEach((option) => {
  option.addEventListener("click", () => selectMode(option))
})

elements.startConfiguredQuiz.addEventListener("click", startQuiz)

// Quiz
elements.nextBtn.addEventListener("click", nextQuestion)
elements.hintBtn.addEventListener("click", showHint)
elements.retryBtn.addEventListener("click", retryQuiz)
elements.reviewBtn.addEventListener("click", reviewAnswers)

// Mobile menu toggle
const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
const navLinks = document.querySelector(".nav-links")

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active")
  })
}

// Functions
function initializeApp() {
  showScreen("landing")
  updateNavigation()
  updateStatsDisplay()
}

function scrollToTopics() {
  const topicsSection = document.getElementById("topics")
  if (topicsSection) {
    topicsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })

    // Add a subtle highlight effect
    setTimeout(() => {
      topicsSection.style.background = "rgba(102, 126, 234, 0.02)"
      setTimeout(() => {
        topicsSection.style.background = ""
      }, 1000)
    }, 500)
  }
}

function updateNavigation() {
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const section = link.dataset.section

      if (section === "home") {
        showSection("home")
      } else if (section === "topics") {
        scrollToTopics()
      } else {
        showSection(section)
      }
    })
  })
}

function selectTopic(selectedCard) {
  // Remove previous selection
  elements.topicCards.forEach((card) => card.classList.remove("selected"))

  // Add selection to clicked card
  selectedCard.classList.add("selected")

  // Get topic
  currentTopic = selectedCard.dataset.topic

  // Update configuration screen
  const config = topicConfig[currentTopic]
  elements.configTopicIcon.textContent = config.icon
  elements.configTopicName.textContent = config.name

  // Show configuration screen
  showScreen("config")
}

function selectTopicAndStart(selectedCard, topic) {
  // Remove previous selection
  elements.topicCards.forEach((card) => card.classList.remove("selected"))

  // Add selection to clicked card
  selectedCard.classList.add("selected")

  // Get topic
  currentTopic = topic

  // Update configuration screen
  const config = topicConfig[currentTopic]
  elements.configTopicIcon.textContent = config.icon
  elements.configTopicName.textContent = config.name

  // Add smooth transition effect
  selectedCard.style.transform = "scale(0.95)"
  setTimeout(() => {
    selectedCard.style.transform = ""
    showScreen("config")
  }, 200)
}

function selectDifficulty(selectedOption) {
  elements.difficultyOptions.forEach((option) => option.classList.remove("selected"))
  selectedOption.classList.add("selected")
  currentDifficulty = selectedOption.dataset.difficulty
  checkConfigurationComplete()
}

function selectQuestionCount(selectedOption) {
  elements.countOptions.forEach((option) => option.classList.remove("selected"))
  selectedOption.classList.add("selected")
  questionCount = Number.parseInt(selectedOption.dataset.count)
  checkConfigurationComplete()
}

function selectMode(selectedOption) {
  elements.modeOptions.forEach((option) => option.classList.remove("selected"))
  selectedOption.classList.add("selected")
  currentMode = selectedOption.dataset.mode
  checkConfigurationComplete()
}

function checkConfigurationComplete() {
  const isComplete = currentDifficulty && questionCount && currentMode
  elements.startConfiguredQuiz.disabled = !isComplete
}

function startQuiz() {
  // Prepare questions based on configuration
  prepareQuestions()

  // Reset state
  currentQuestionIndex = 0
  score = 0
  selectedAnswer = null
  startTime = Date.now()
  elapsedTime = 0
  userAnswers = []
  difficultyStats = {
    basic: { correct: 0, total: 0 },
    intermediate: { correct: 0, total: 0 },
    advanced: { correct: 0, total: 0 },
  }

  // Update UI
  elements.totalQ.textContent = currentQuestions.length
  elements.currentTopic.textContent = topicConfig[currentTopic].name
  elements.currentDifficulty.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)

  // Start timer
  startTimer()

  // Show quiz screen
  showScreen("quiz")

  // Load first question
  loadQuestion()
}

function prepareQuestions() {
  const topicQuestions = quizData[currentTopic] || []
  let filteredQuestions = []

  if (currentDifficulty === "mixed") {
    filteredQuestions = topicQuestions
  } else {
    filteredQuestions = topicQuestions.filter((q) => q.difficulty === currentDifficulty)
  }

  // Shuffle and select required number of questions
  currentQuestions = shuffleArray(filteredQuestions).slice(0, questionCount)
}

function loadQuestion() {
  const question = currentQuestions[currentQuestionIndex]

  // Update progress
  const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100
  elements.progressFill.style.width = `${progress}%`
  elements.currentQ.textContent = currentQuestionIndex + 1

  // Update question info
  elements.questionText.textContent = question.question
  elements.questionDifficulty.textContent = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)
  elements.questionType.textContent = question.type.charAt(0).toUpperCase() + question.type.slice(1)

  // Hide hint
  elements.questionHint.style.display = "none"
  elements.hintBtn.style.display = question.hint ? "flex" : "none"

  // Clear previous options
  elements.optionsContainer.innerHTML = ""

  // Create options
  question.options.forEach((option, index) => {
    const optionElement = document.createElement("div")
    optionElement.className = "option"
    optionElement.innerHTML = `<span class="option-text">${option}</span>`
    optionElement.addEventListener("click", () => selectOption(optionElement, index))
    elements.optionsContainer.appendChild(optionElement)
  })

  // Reset next button
  elements.nextBtn.disabled = true
  selectedAnswer = null

  // Update next button text
  const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1
  elements.nextBtn.querySelector("span").textContent = isLastQuestion ? "Finish Quiz" : "Next Question"
}

function selectOption(optionElement, index) {
  // Remove previous selection
  document.querySelectorAll(".option").forEach((opt) => {
    opt.classList.remove("selected")
  })

  // Select current option
  optionElement.classList.add("selected")
  selectedAnswer = index

  // Enable next button
  elements.nextBtn.disabled = false
}

function showHint() {
  const question = currentQuestions[currentQuestionIndex]
  if (question.hint) {
    elements.questionHint.style.display = "flex"
    elements.questionHint.querySelector(".hint-text").textContent = question.hint
    elements.hintBtn.style.display = "none"
  }
}

function nextQuestion() {
  const question = currentQuestions[currentQuestionIndex]
  const isCorrect = selectedAnswer === question.correct

  // Store user answer
  userAnswers.push({
    question: question.question,
    options: question.options,
    userAnswer: selectedAnswer,
    correctAnswer: question.correct,
    isCorrect: isCorrect,
    difficulty: question.difficulty,
    type: question.type,
    hint: question.hint,
  })

  // Update stats
  if (isCorrect) {
    score++
  }
  difficultyStats[question.difficulty].total++
  if (isCorrect) {
    difficultyStats[question.difficulty].correct++
  }

  if (currentMode === "practice") {
    // Show correct/wrong answers immediately
    showAnswerFeedback()

    // Wait before next question
    setTimeout(() => {
      proceedToNext()
    }, 2000)
  } else {
    // Exam mode - proceed immediately
    proceedToNext()
  }

  // Disable next button
  elements.nextBtn.disabled = true
}

function showAnswerFeedback() {
  const question = currentQuestions[currentQuestionIndex]

  document.querySelectorAll(".option").forEach((opt, index) => {
    if (index === question.correct) {
      opt.classList.add("correct")
    } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
      opt.classList.add("wrong")
    }
    opt.style.pointerEvents = "none"
  })
}

function proceedToNext() {
  currentQuestionIndex++

  if (currentQuestionIndex < currentQuestions.length) {
    loadQuestion()
  } else {
    showResults()
  }
}

function startTimer() {
  quizTimer = setInterval(() => {
    elapsedTime = Date.now() - startTime
    updateTimerDisplay()
  }, 1000)
}

function updateTimerDisplay() {
  const minutes = Math.floor(elapsedTime / 60000)
  const seconds = Math.floor((elapsedTime % 60000) / 1000)
  elements.timeDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function showResults() {
  // Stop timer
  if (quizTimer) {
    clearInterval(quizTimer)
  }

  const percentage = Math.round((score / currentQuestions.length) * 100)
  const timeTakenSeconds = Math.round(elapsedTime / 1000)

  // Update results
  document.getElementById("scorePercentage").textContent = `${percentage}%`
  document.getElementById("correctAnswers").textContent = score
  document.getElementById("wrongAnswers").textContent = currentQuestions.length - score
  document.getElementById("timeTaken").textContent = formatTime(timeTakenSeconds)
  document.getElementById("accuracy").textContent = `${percentage}%`

  // Update result message
  updateResultMessage(percentage)

  // Update difficulty breakdown
  updateDifficultyBreakdown()

  // Animate score circle
  animateScoreCircle(percentage)

  updateStats({
    topic: currentTopic,
    difficulty: currentDifficulty,
    score: score,
    total: currentQuestions.length,
    elapsedTime: elapsedTime,
  })

  // Show results screen
  showScreen("results")
}

function updateResultMessage(percentage) {
  const resultTitle = document.getElementById("resultTitle")
  const resultMessage = document.getElementById("resultMessage")
  const resultsBadge = document.getElementById("resultsBadge")
  const levelIcon = document.getElementById("levelIcon")
  const levelTitle = document.getElementById("levelTitle")
  const levelDescription = document.getElementById("levelDescription")

  if (percentage >= 90) {
    resultTitle.textContent = "Outstanding! 🏆"
    resultMessage.textContent = "You have mastered this topic!"
    resultsBadge.textContent = "Expert Level"
    levelIcon.textContent = "🏆"
    levelTitle.textContent = "Expert Level"
    levelDescription.textContent = "Outstanding performance!"
  } else if (percentage >= 80) {
    resultTitle.textContent = "Excellent! 🎉"
    resultMessage.textContent = "You have a strong understanding!"
    resultsBadge.textContent = "Advanced Level"
    levelIcon.textContent = "🎉"
    levelTitle.textContent = "Advanced Level"
    levelDescription.textContent = "Excellent work!"
  } else if (percentage >= 70) {
    resultTitle.textContent = "Good Job! 👍"
    resultMessage.textContent = "You have a solid foundation!"
    resultsBadge.textContent = "Intermediate Level"
    levelIcon.textContent = "👍"
    levelTitle.textContent = "Intermediate Level"
    levelDescription.textContent = "Good understanding!"
  } else if (percentage >= 60) {
    resultTitle.textContent = "Not Bad! 📚"
    resultMessage.textContent = "Keep learning and practicing!"
    resultsBadge.textContent = "Basic Level"
    levelIcon.textContent = "📚"
    levelTitle.textContent = "Basic Level"
    levelDescription.textContent = "Room for improvement!"
  } else {
    resultTitle.textContent = "Keep Trying! 💪"
    resultMessage.textContent = "Practice makes perfect!"
    resultsBadge.textContent = "Beginner Level"
    levelIcon.textContent = "💪"
    levelTitle.textContent = "Beginner Level"
    levelDescription.textContent = "Keep practicing!"
  }
}

function updateDifficultyBreakdown() {
  const breakdownContainer = document.querySelector(".breakdown-items")
  breakdownContainer.innerHTML = ""

  Object.keys(difficultyStats).forEach((difficulty) => {
    const stats = difficultyStats[difficulty]
    if (stats.total > 0) {
      const percentage = Math.round((stats.correct / stats.total) * 100)
      const item = document.createElement("div")
      item.className = "breakdown-item"
      item.innerHTML = `
                <span class="breakdown-label">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                <span class="breakdown-score">${stats.correct}/${stats.total} (${percentage}%)</span>
            `
      breakdownContainer.appendChild(item)
    }
  })
}

function animateScoreCircle(percentage) {
  const circumference = 2 * Math.PI * 90
  const scoreCircle = document.getElementById("scoreCircle")
  scoreCircle.style.strokeDasharray = circumference
  scoreCircle.style.strokeDashoffset = circumference

  setTimeout(() => {
    const offset = circumference - (percentage / 100) * circumference
    scoreCircle.style.strokeDashoffset = offset
    scoreCircle.style.transition = "stroke-dashoffset 2s ease-in-out"
  }, 500)
}

function retryQuiz() {
  showScreen("config")
}

function reviewAnswers() {
  // Create review modal or screen
  createReviewModal()
}

function createReviewModal() {
  // Remove existing modal if any
  const existingModal = document.querySelector(".review-modal")
  if (existingModal) {
    existingModal.remove()
  }

  const modal = document.createElement("div")
  modal.className = "review-modal"
  modal.innerHTML = `
        <div class="review-modal-content">
            <div class="review-header">
                <h2>Review Your Answers</h2>
                <button class="close-review">×</button>
            </div>
            <div class="review-body">
                ${userAnswers
                  .map(
                    (answer, index) => `
                    <div class="review-item ${answer.isCorrect ? "correct" : "wrong"}">
                        <div class="review-question">
                            <span class="question-number">Q${index + 1}</span>
                            <span class="question-text">${answer.question}</span>
                        </div>
                        <div class="review-options">
                            ${answer.options
                              .map(
                                (option, optIndex) => `
                                <div class="review-option ${optIndex === answer.correctAnswer ? "correct-answer" : ""} ${optIndex === answer.userAnswer && !answer.isCorrect ? "wrong-answer" : ""}">
                                    ${option}
                                    ${optIndex === answer.correctAnswer ? " ✓" : ""}
                                    ${optIndex === answer.userAnswer && !answer.isCorrect ? " ✗" : ""}
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                        ${answer.hint ? `<div class="review-hint">💡 ${answer.hint}</div>` : ""}
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `

  document.body.appendChild(modal)

  // Add event listener to close button
  modal.querySelector(".close-review").addEventListener("click", () => {
    modal.remove()
  })

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })
}

function showSection(sectionName) {
  // Hide all screens
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("active")
  })

  // Update navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active")
    if (link.dataset.section === sectionName) {
      link.classList.add("active")
    }
  })

  // Show target screen
  setTimeout(() => {
    if (sectionName === "home" || sectionName === "topics") {
      screens.landing.classList.add("active")
    } else {
      const targetScreen = document.getElementById(sectionName)
      if (targetScreen) {
        targetScreen.classList.add("active")
      }
    }
  }, 300)
}

function showScreen(screenName) {
  // Hide all screens
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("active")
  })

  // Show target screen with delay for smooth transition
  setTimeout(() => {
    screens[screenName].classList.add("active")
  }, 300)

  // Reset selections when going back to landing
  if (screenName === "landing") {
    elements.topicCards.forEach((card) => card.classList.remove("selected"))
    elements.difficultyOptions.forEach((option) => option.classList.remove("selected"))
    elements.countOptions.forEach((option) => option.classList.remove("selected"))
    elements.modeOptions.forEach((option) => option.classList.remove("selected"))
    elements.startConfiguredQuiz.disabled = true
    currentTopic = ""
    currentDifficulty = ""
    currentMode = "practice"
    questionCount = 10

    // Stop timer if running
    if (quizTimer) {
      clearInterval(quizTimer)
    }
  }
}

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Stats Management
function updateStats(quizResults) {
  const stats = getStats()

  stats.totalQuizzes++
  stats.totalTime += Math.round(quizResults.elapsedTime / 1000)

  const percentage = Math.round((quizResults.score / quizResults.total) * 100)
  stats.scores.push(percentage)

  if (percentage > stats.bestScore) {
    stats.bestScore = percentage
  }

  stats.averageScore = Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length)

  // Update technology performance
  if (!stats.techPerformance[quizResults.topic]) {
    stats.techPerformance[quizResults.topic] = { scores: [], average: 0 }
  }
  stats.techPerformance[quizResults.topic].scores.push(percentage)
  stats.techPerformance[quizResults.topic].average = Math.round(
    stats.techPerformance[quizResults.topic].scores.reduce((a, b) => a + b, 0) /
      stats.techPerformance[quizResults.topic].scores.length,
  )

  // Add recent activity
  stats.recentActivity.unshift({
    topic: quizResults.topic,
    score: percentage,
    date: new Date().toISOString(),
    difficulty: quizResults.difficulty,
  })

  if (stats.recentActivity.length > 10) {
    stats.recentActivity = stats.recentActivity.slice(0, 10)
  }

  saveStats(stats)
  updateStatsDisplay()
  checkAchievements(stats)
}

function getStats() {
  const defaultStats = {
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
    scores: [],
    techPerformance: {},
    recentActivity: [],
    achievements: [],
  }

  const saved = localStorage.getItem("devquiz-stats")
  return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats
}

function saveStats(stats) {
  localStorage.setItem("devquiz-stats", JSON.stringify(stats))
}

function updateStatsDisplay() {
  const stats = getStats()

  // Update overview cards
  document.getElementById("totalQuizzes").textContent = stats.totalQuizzes
  document.getElementById("averageScore").textContent = `${stats.averageScore}%`
  document.getElementById("bestScore").textContent = `${stats.bestScore}%`
  document.getElementById("totalTime").textContent = formatTime(stats.totalTime)

  // Update performance chart
  Object.keys(topicConfig).forEach((tech) => {
    const chartFill = document.querySelector(`[data-tech="${tech}"]`)
    const chartScore = chartFill?.parentElement.nextElementSibling

    if (stats.techPerformance[tech]) {
      const average = stats.techPerformance[tech].average
      if (chartFill) chartFill.style.width = `${average}%`
      if (chartScore) chartScore.textContent = `${average}%`
    }
  })

  // Update recent activity
  const activityList = document.getElementById("recentActivity")
  if (stats.recentActivity.length === 0) {
    activityList.innerHTML = `
            <div class="activity-item empty">
                <div class="activity-icon">📝</div>
                <div class="activity-content">
                    <p>No quizzes completed yet</p>
                    <span class="activity-time">Start your first quiz to see activity here</span>
                </div>
            </div>
        `
  } else {
    activityList.innerHTML = stats.recentActivity
      .map(
        (activity) => `
            <div class="activity-item">
                <div class="activity-icon">${topicConfig[activity.topic]?.icon || "📝"}</div>
                <div class="activity-content">
                    <p>${topicConfig[activity.topic]?.name || activity.topic} - ${activity.score}%</p>
                    <span class="activity-time">${new Date(activity.date).toLocaleDateString()}</span>
                </div>
            </div>
        `,
      )
      .join("")
  }
}

function checkAchievements(stats) {
  const achievements = [
    { id: "first-quiz", name: "First Steps", condition: () => stats.totalQuizzes >= 1 },
    { id: "perfect-score", name: "Perfect Score", condition: () => stats.bestScore === 100 },
    { id: "knowledge-seeker", name: "Knowledge Seeker", condition: () => stats.totalQuizzes >= 10 },
    { id: "expert-level", name: "Expert Level", condition: () => stats.averageScore >= 90 },
  ]

  achievements.forEach((achievement) => {
    if (achievement.condition() && !stats.achievements.includes(achievement.id)) {
      stats.achievements.push(achievement.id)
      showAchievementNotification(achievement.name)
    }
  })

  updateAchievementsDisplay(stats.achievements)
}

function showAchievementNotification(name) {
  // Create achievement notification
  const notification = document.createElement("div")
  notification.className = "achievement-notification"
  notification.innerHTML = `
        <div class="achievement-popup">
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <h4>Achievement Unlocked!</h4>
                <p>${name}</p>
            </div>
        </div>
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

function updateAchievementsDisplay(unlockedAchievements) {
  const achievementsGrid = document.getElementById("achievementsGrid")
  const achievements = [
    { id: "first-quiz", icon: "🎯", name: "First Steps", description: "Complete your first quiz" },
    { id: "perfect-score", icon: "🔥", name: "Perfect Score", description: "Get 100% on any quiz" },
    { id: "knowledge-seeker", icon: "📚", name: "Knowledge Seeker", description: "Complete 10 quizzes" },
    { id: "expert-level", icon: "🏆", name: "Expert Level", description: "Average 90%+ across all topics" },
  ]

  achievementsGrid.innerHTML = achievements
    .map(
      (achievement) => `
        <div class="achievement-item ${unlockedAchievements.includes(achievement.id) ? "unlocked" : "locked"}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
            </div>
        </div>
    `,
    )
    .join("")
}

// Add CSS for review modal
const reviewModalStyles = `
.review-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 2rem;
}

.review-modal-content {
    background: white;
    border-radius: 20px;
    max-width: 800px;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid var(--border-color);
}

.review-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}

.close-review {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.close-review:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.review-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 2rem 2rem;
}

.review-item {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border-radius: 16px;
    border: 2px solid var(--border-color);
}

.review-item.correct {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
}

.review-item.wrong {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
}

.review-question {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.question-number {
    background: var(--primary-gradient);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    flex-shrink: 0;
}

.question-text {
    font-weight: 600;
    color: var(--text-primary);
}

.review-options {
    display: grid;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.review-option {
    padding: 0.75rem;
    border-radius: 8px;
    background: var(--bg-secondary);
}

.review-option.correct-answer {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    font-weight: 600;
}

.review-option.wrong-answer {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    font-weight: 600;
}

.review-hint {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

@media (max-width: 768px) {
    .review-modal {
        padding: 1rem;
    }
    
    .review-header {
        padding: 1.5rem;
    }
    
    .review-body {
        padding: 1rem 1.5rem 1.5rem;
    }
    
    .review-item {
        padding: 1rem;
    }
    
    .review-question {
        flex-direction: column;
        gap: 0.5rem;
    }
}
`

// Add the styles to the document
const styleSheet = document.createElement("style")
styleSheet.textContent = reviewModalStyles
document.head.appendChild(styleSheet)
