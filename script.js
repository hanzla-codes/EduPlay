// --- Scoring Configuration ---
const LEVEL_POINTS = {
  beginner: 2,
  intermediate: 5,
  advanced: 10,
};

let quizData = {}; // Shuru mein khali rakhein

// Data load karne ka function
async function loadQuizData() {
  try {
    const response = await fetch("quizData.json");
    quizData = await response.json();
    console.log("Questions loaded successfully!");
  } catch (error) {
    console.error("Error loading JSON:", error);
  }
}

// App shuru hote hi data load karein
loadQuizData();

// --- Level Descriptions ---
const LEVEL_DESCRIPTIONS = {
  beginner: {
    title: "Beginner Level: The Foundations",
    description:
      "Focuses on the core syntax, basic tags, fundamental CSS properties, and simple JavaScript variables. Get ready to build your base!",
  },
  intermediate: {
    title: "Intermediate Level: Practical Application",
    description:
      "Tests your understanding of layout (Flexbox/Grid), asynchronous JS (Fetch), and scope/loops. These are essential for modern web development.",
  },
  advanced: {
    title: "Advanced Level: Deep Dive",
    description:
      "Challenges your knowledge of complex JS concepts like Closures, Call Stack, REST methods (POST), and advanced CSS units (rem). Prove your mastery!",
  },
};

// --- Quiz Data (Same as before) ---

// --- State Variables ---
let currentLevel = "beginner";
let currentQuestionIndex = 0;
let selectedOption = null;
let totalScore = 0;
let levelScores = {
  beginner: 0,
  intermediate: 0,
  advanced: 0,
};
let user = null; // Holds the logged-in username

// --- DOM Elements ---
// Layout & Header
const authPageContainer = document.getElementById("authPageContainer"); // Landing Page
const authFormsWrapper = document.getElementById("authFormsWrapper"); // Forms Wrapper
const loggedInContent = document.getElementById("loggedInContent");
const authNavButtons = document.getElementById("authNavButtons");
const loggedInNav = document.getElementById("loggedInNav");
const navLinks = document.getElementById("Nav-links");
const userNameDisplay = document.getElementById("userNameDisplay");
const appHeader = document.getElementById("appHeader"); // for message
const mobileNav = document.getElementById("mobileNav");
const hamburgerBtn = document.getElementById("hamburgerBtn");

// Auth Pages
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const loginMsg = document.getElementById("loginMsg");
const registerMsg = document.getElementById("registerMsg");

// Logged In Pages
const homePage = document.getElementById("homePage");
const quizPage = document.getElementById("quizPage");
const resultPage = document.getElementById("resultPage");

// Quiz Elements
const currentLevelTitle = document.getElementById("currentLevelTitle");
const currentLevelDescription = document.getElementById(
  "currentLevelDescription"
);
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const answerInput = document.getElementById("answerInput");
const advancedInput = document.getElementById("advancedInput");
const progressElement = document.getElementById("progress");
const progressFill = document.getElementById("progressFill");
const levelText = document.getElementById("levelText");
const scoreText = document.getElementById("scoreText");
const messageBox = document.getElementById("messageBox");
const messageText = document.getElementById("messageText");
const msgBtns = document.getElementById("msgBtns"); // Button container for choices
const submitButton = quizPage.querySelector("button"); // Get the main submit button

// --- Page Navigation/State Management ---

function toggleMobileMenu() {
  mobileNav.classList.toggle("show");
}


function hideAllContent() {
  // Hide all internal pages
  authPageContainer.classList.add("hidden"); // Landing page
  authFormsWrapper.classList.add("hidden"); // Forms wrapper
  loggedInContent.classList.add("hidden"); // Logged in pages container

  // Hide specific forms (just in case)
  loginPage.classList.add("hidden");
  registerPage.classList.add("hidden");

  // Hide specific logged-in pages
  homePage.classList.add("hidden");
  quizPage.classList.add("hidden");
  resultPage.classList.add("hidden");
}

function updateNavigationState(isLoggedIn) {
  if (isLoggedIn) {
    authNavButtons.classList.add("hidden");
    navLinks.classList.add("hidden");
    loggedInNav.classList.remove("hidden");
    userNameDisplay.textContent = `Hello, ${user}`;

    // Hide landing/auth forms
    authPageContainer.classList.add("hidden");
    authFormsWrapper.classList.add("hidden");

    // Show logged in content area
    loggedInContent.classList.remove("hidden");
  } else {
    authNavButtons.classList.remove("hidden");
    loggedInNav.classList.add("hidden");

    // Hide logged in content area
    loggedInContent.classList.add("hidden");
  }
}

function showLandingPage() {
  hideAllContent(); // Hide Home, Quiz, Result, Login, Register
  updateNavigationState(false); // Ensure header is in logged-out state
  authPageContainer.classList.remove("hidden"); // Show the main informative landing page
  authFormsWrapper.classList.add("hidden"); // Ensure forms are closed
}

function showLogin() {
  hideAllContent(); // Hide Home, Quiz, Result, Register, Landing Page
  updateNavigationState(false);

  // Hide Landing Page content for better focus on the form
  authPageContainer.classList.add("hidden");

  // Show forms wrapper and the login form
  authFormsWrapper.classList.remove("hidden");
  loginPage.classList.remove("hidden");
  registerPage.classList.add("hidden");
}

function showRegister() {
  hideAllContent(); // Hide Home, Quiz, Result, Login, Landing Page
  updateNavigationState(false);

  // Hide Landing Page content for better focus on the form
  authPageContainer.classList.add("hidden");

  // Show forms wrapper and the register form
  authFormsWrapper.classList.remove("hidden");
  registerPage.classList.remove("hidden");
  loginPage.classList.add("hidden");
}

function showHome() {
  hideAllContent();
  authFormsWrapper.classList.add("hidden"); // Forms close
  updateNavigationState(true);

  // Reset quiz state (if needed)
  currentLevel = "beginner";
  currentQuestionIndex = 0;

  document.getElementById("homeWelcome").textContent = `Welcome, ${user}!`;
  loggedInContent.classList.remove("hidden");
  homePage.classList.remove("hidden");
}

// --- Logout Functionality ---
function logout() {
  user = null;
  // After logout, show the Landing Page
  showLandingPage();
  updateInfoMessage(
    appHeader,
    "You have been logged out successfully. Please login again to continue.",
    true
  );
}

// --- Authentication (Local Storage Mock) ---
const users = JSON.parse(localStorage.getItem("users")) || {};

function updateInfoMessage(element, message, success = false) {
  let msgElement = element;
  if (msgElement.id === "appHeader") {
    const flash = document.createElement("div");
    flash.textContent = message;
    flash.style.cssText = `
            position: absolute; top: 0; left: 0; right: 0; 
            background: ${success ? "#d4edda" : "#f8d7da"}; 
            color: ${success ? "#155724" : "#721c24"}; 
            padding: 10px; text-align: center; z-index: 1000;
            transition: all 0.5s;
        `;
    document.body.appendChild(flash);
    setTimeout(() => {
      document.body.removeChild(flash);
    }, 3000);
    return;
  }

  msgElement.textContent = message;
  msgElement.classList.remove("hidden");
  msgElement.style.color = success ? "var(--primary-color)" : "red";
  setTimeout(() => {
    msgElement.classList.add("hidden");
  }, 3000);
}

function login() {
  const usernameInput = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  if (users[usernameInput] && users[usernameInput] === pass) {
    user = usernameInput;
    updateInfoMessage(loginMsg, `Logging in...`, true);
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";
    setTimeout(showHome, 1000);
  } else {
    updateInfoMessage(loginMsg, "Invalid username or password.");
  }
}

function register() {
  const usernameInput = document.getElementById("regUser").value;
  const pass = document.getElementById("regPass").value;

  if (usernameInput.length < 3 || pass.length < 6) {
    updateInfoMessage(
      registerMsg,
      "Username must be at least 3 chars. Password must be at least 6 chars."
    );
    return;
  }

  if (users[usernameInput]) {
    updateInfoMessage(registerMsg, "Username already exists.");
  } else {
    users[usernameInput] = pass;
    localStorage.setItem("users", JSON.stringify(users));
    updateInfoMessage(registerMsg, "Registration successful!", true);
    document.getElementById("regUser").value = "";
    document.getElementById("regPass").value = "";
    user = usernameInput;
    setTimeout(showHome, 1000);
  }
}

// --- Enter Key Handler ---
function handleKeyPress(event, action) {
  // Check if the pressed key is Enter (key code 13 or key 'Enter')
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault(); // Prevent default form submission

    if (action === "login") {
      login();
    } else if (action === "register") {
      register();
    } else if (action === "submit") {
      submitAnswer();
    }
  }
}

// --- Quiz Logic ---

function startQuiz() {
  currentLevel = "beginner";
  currentQuestionIndex = 0;
  totalScore = 0;
  levelScores = { beginner: 0, intermediate: 0, advanced: 0 };
  hideAllContent();
  loggedInContent.classList.remove("hidden");
  quizPage.classList.remove("hidden");
  quizPage.classList.remove("animate");
  void quizPage.offsetWidth;
  quizPage.classList.add("animate");
  loadQuestion();
}

function loadQuestion() {
  messageBox.classList.add("hidden");
  msgBtns.classList.add("hidden"); // Ensure decision buttons are hidden
  submitButton.classList.remove("hidden"); // Ensure submit button is visible

  loggedInContent.classList.remove("hidden");
  quizPage.classList.remove("hidden");

  const levelQuestions = quizData[currentLevel];
  if (currentQuestionIndex >= levelQuestions.length) {
    handleLevelCompletion();
    return;
  }

  const currentQuestion = levelQuestions[currentQuestionIndex];
  const currentDescription = LEVEL_DESCRIPTIONS[currentLevel];

  currentLevelTitle.textContent = currentDescription.title;
  currentLevelDescription.textContent = currentDescription.description;

  levelText.textContent = `${currentLevel.toUpperCase()} Level (Points per correct answer: ${
    LEVEL_POINTS[currentLevel]
  })`;
  questionElement.textContent = currentQuestion.question;

  // Reset inputs and options
  optionsElement.innerHTML = "";
  answerInput.classList.add("hidden");
  advancedInput.classList.add("hidden");
  selectedOption = null;
  answerInput.value = "";
  advancedInput.value = ""; // Clear advanced input too

  // Update progress bar
  const totalQuestions = levelQuestions.length;
  const currentQNumber = currentQuestionIndex + 1;
  progressElement.textContent = `Question ${currentQNumber} of ${totalQuestions} | Total Score: ${totalScore}`;
  const progressPercentage = (currentQuestionIndex / totalQuestions) * 100;
  progressFill.style.width = `${progressPercentage}%`;

  if (currentQuestion.type === "multiple-choice") {
    currentQuestion.options.forEach((optionText) => {
      const option = document.createElement("div");
      option.classList.add("option");
      option.textContent = optionText;
      option.onclick = () => selectOption(option, optionText);
      optionsElement.appendChild(option);
    });
  } else if (currentQuestion.type === "short-answer") {
    answerInput.classList.remove("hidden");
  }
}

function selectOption(element, text) {
  document
    .querySelectorAll(".option")
    .forEach((opt) => opt.classList.remove("selected"));
  element.classList.add("selected");
  selectedOption = text;
}

function submitAnswer() {
  let userAnswer;
  const currentQuestion = quizData[currentLevel][currentQuestionIndex];
 messageBox.classList.remove("warning-shake", "correct-trigger");
  if (currentQuestion.type === "multiple-choice") {
    userAnswer = selectedOption;
  } else if (currentQuestion.type === "short-answer") {
    userAnswer = answerInput.value.trim();
    if (!userAnswer) {
      userAnswer = advancedInput.value.trim();
    }
  }

  if (!userAnswer) {
    messageText.textContent = "Please provide an answer before submitting.";
    messageBox.classList.remove("hidden");
    return;
  }

  let isCorrect = false;
  const sanitizedAnswer = currentQuestion.answer
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .toLowerCase()
    .trim();
  const sanitizedUserAnswer = userAnswer
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .toLowerCase()
    .trim();

  if (currentQuestion.type === "multiple-choice") {
    isCorrect = userAnswer === currentQuestion.answer;
  } else {
    isCorrect = sanitizedUserAnswer === sanitizedAnswer;
  }

  // --- Scoring & Message ---
  if (isCorrect) {
    const points = LEVEL_POINTS[currentLevel];
    totalScore += points;
    levelScores[currentLevel] += points;
    messageBox.classList.remove("hidden");
    messageBox.classList.add("correct-trigger")
    messageText.innerHTML = `<span style="color:green; font-weight:bold;">Correct!</span> You earned ${points} points.`;
  } else {
    messageBox.classList.remove("hidden");
    messageBox.classList.add("warning-shake");
    messageText.innerHTML = `<span style="color:red; font-weight:bold;">Incorrect!</span> The correct answer was: <strong>${currentQuestion.answer}</strong>.`;
  }

  // --- Delay ki jagah "Next" button ka logic ---
  submitButton.classList.add("hidden"); // Submit button ko chupayein
  messageBox.classList.remove("hidden");
  msgBtns.classList.remove("hidden");
  msgBtns.innerHTML = ""; // Pehle se maujood buttons clear karein

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next Question →";
  nextBtn.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData[currentLevel].length) {
      loadQuestion();
    } else {
      handleLevelCompletion();
    }
  };
  msgBtns.appendChild(nextBtn);
}

function goToNextLevel() {
  let nextLevel = "";
  if (currentLevel === "beginner") {
    nextLevel = "intermediate";
  } else if (currentLevel === "intermediate") {
    nextLevel = "advanced";
  }

  // Reset and load the next level
  currentLevel = nextLevel;
  currentQuestionIndex = 0;
  loadQuestion();
}

/**
 * Handles the completion of a quiz level, giving the user the option to continue or view results.
 */
function handleLevelCompletion() {
  progressFill.style.width = "100%";
  submitButton.classList.add("hidden"); // Hide submit button

  let completionMessage = "";

  if (currentLevel === "beginner") {
    completionMessage =
      "<b>Beginner Level Complete!</b> Your foundational score is recorded. Would you like to proceed?";
  } else if (currentLevel === "intermediate") {
    completionMessage =
      "<b>Intermediate Level Complete!</b> Challenge accepted. Ready for the Advanced questions?";
  } else if (currentLevel === "advanced") {
    // If Advanced is complete, skip the choice and show result directly
    showResult();
    return;
  }

  messageText.innerHTML = completionMessage;
  messageBox.classList.remove("hidden");
  msgBtns.classList.remove("hidden"); // Show the decision buttons

  // Clear and create new buttons
  msgBtns.innerHTML = "";

  // 1. Continue Button (Primary Action)
  const continueBtn = document.createElement("button");
  continueBtn.textContent = `Continue to ${
    currentLevel === "beginner" ? "Intermediate" : "Advanced"
  }`;
  continueBtn.onclick = goToNextLevel;
  msgBtns.appendChild(continueBtn);

  // 2. Show Result Button (Secondary Action)
  const resultBtn = document.createElement("button");
  resultBtn.textContent = "End Quiz & View Score";
  resultBtn.classList.add("secondary-btn");
  resultBtn.onclick = showResult;
  msgBtns.appendChild(resultBtn);
}

// --- Result Page Logic with Remarks ---
function getRemarks(totalScore, maxScore) {
  const percentage = (totalScore / maxScore) * 100;
  if (percentage >= 90) return "Excellent! You have mastered Web Technologies.";
  if (percentage >= 70) return "Great Job! Strong knowledge base.";
  if (percentage >= 50)
    return "Good effort. Keep practicing the advanced concepts.";
  return "Needs improvement. Focus on the basics first.";
}

function showResult() {
  hideAllContent();
  loggedInContent.classList.remove("hidden");
  resultPage.classList.remove("hidden");

  const maxBeginner = quizData.beginner.length * LEVEL_POINTS.beginner;
  const maxIntermediate =
    quizData.intermediate.length * LEVEL_POINTS.intermediate;
  const maxAdvanced = quizData.advanced.length * LEVEL_POINTS.advanced;
  const maxTotalScore = maxBeginner + maxIntermediate + maxAdvanced;

  const remarks = getRemarks(totalScore, maxTotalScore);

  scoreText.innerHTML = `
        <h3 style="color: var(--primary-color);">Final Scorecard for ${
          user || "User"
        }</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="background-color: var(--primary-color); color: white;">
                    <th style="padding: 10px; border: 1px solid #e0e0e0;">Level</th>
                    <th style="padding: 10px; border: 1px solid #e0e0e0;">Points Earned</th>
                    <th style="padding: 10px; border: 1px solid #e0e0e0;">Max Points</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">Beginner</td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">${
                      levelScores.beginner
                    }</td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">${maxBeginner}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">Intermediate</td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">${
                      levelScores.intermediate
                    }</td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">${maxIntermediate}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">Advanced</td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">${
                      levelScores.advanced
                    }</td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">${maxAdvanced}</td>
                </tr>
            </tbody>
        </table>

        <div class="remark-box" style="margin-top: 30px;">
            <p style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">
                Total Score: ${totalScore} / ${maxTotalScore}
            </p>
            <p style="font-size: 18px; font-style: italic;">
                Remarks: ${remarks}
            </p>
        </div>
    `;
}

// --- Initial Setup ---
document.addEventListener("DOMContentLoaded", () => {
  // Check local storage for user state (though user variable is null on fresh load, this is good practice)
  if (localStorage.getItem("currentUser")) {
    // In a real app, you'd fetch user data. Here we mock it.
    // If you want to persist the user, uncomment and adjust:
    // user = localStorage.getItem('currentUser');
    // showHome();
  }

  // Since we are not persisting user state in this mock app, show landing page.
  if (user) {
    showHome();
  } else {
    showLandingPage();
  }
});

// Result generate karte waqt score element par ye class laga dena
document.getElementById('finalScoreDisplay').classList.add('final-score-anim');