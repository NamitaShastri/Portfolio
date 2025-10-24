const correctAudio = new Audio("correct.mp3"); 
const incorrectAudio = new Audio("incorrect.mp3"); 

const levels = [
    { gridSize: 8, words: ["SCI", "TECH", "RAM", "LUA", "ROM"] },
    { gridSize: 10, words: ["PYTHON", "JAVASCRIPT", "HTML", "CSS", "REACT"] },
    { gridSize: 12, words: ["MACHINE", "LEARNING", "ALGORITHM", "DATABASE", "KOTLIN"] },
    { gridSize: 14, words: ["SCIENTIFIC", "CALCULATOR", "ASTRONOMY", "BIOINFORMATICS", "HYPOTHESIS"] },
    { gridSize: 16, words: ["THERMODYNAMICS", "METAPHYSICS", "ELECTROMAGNETISM", "QUANTUM", "NANOTECHNOLOGY"] }
];

let currentLevel = 0;
let selectedCells = [];
let foundWords = [];
let timeLeft = 50;
let score = 0;
let timerInterval;
let isDragging = false;

// Background Music
const bgMusic = new Audio("gamemusicloop.mp3"); 
bgMusic.loop = true;
bgMusic.volume = 0.5;

document.addEventListener("DOMContentLoaded", () => {
    const startGameBtn = document.getElementById("startGameBtn");
    const startScreen = document.getElementById("startScreen");
    const gameContainer = document.getElementById("gameContainer");

    if (startGameBtn) {
        startGameBtn.addEventListener("click", () => {
            const playerNameInput = document.getElementById("playerName").value.trim();

            if (!playerNameInput) {
                alert("Please enter your name to start the game!");
                return;
            }

            localStorage.setItem("playerName", playerNameInput); // Store player name
            document.getElementById("playerDisplay").textContent = `Player: ${playerNameInput}`; // Show in UI

            startScreen.classList.add("fade-out");
            setTimeout(() => {
                startScreen.style.display = "none";
                gameContainer.style.display = "block"; // Show game
                gameContainer.style.opacity = "1"; // Fade-in effect

                bgMusic.play().catch(error => {
                    console.error("Audio play failed:", error);
                    alert("Audio could not be played. Please check your browser settings.");
                });

                setTimeout(() => { 
                    renderGrid(); // Render grid
                    startTimer(); // Start timer
                }, 200);
            }, 1000);
        });
    }
});


// Get words for the current level
const getWordsForLevel = () => levels[currentLevel].words;

// Generate a grid based on the level size and words
const generateGrid = (size, words) => {
    let grid = Array.from({ length: size }, () => Array(size).fill(""));

    words.forEach(word => {
        let placed = false;
        while (!placed) {
            let direction = Math.random() < 0.5 ? "horizontal" : "vertical";
            let row = Math.floor(Math.random() * size);
            let col = Math.floor(Math.random() * (size - word.length));

            if (direction === "horizontal" && col + word.length <= size) {
                if (grid[row].slice(col, col + word.length).every(cell => cell === "")) {
                    word.split("").forEach((char, i) => grid[row][col + i] = char);
                    placed = true;
                }
            } else if (direction === "vertical" && row + word.length <= size) {
                if (grid.slice(row, row + word.length).every(rowArr => rowArr[col] === "")) {
                    word.split("").forEach((char, i) => {
                        if (!grid[row + i]) grid[row + i] = []; // Ensure row exists
                        grid[row + i][col] = char;
                    });
                    placed = true;
                }
            }
        }
    });

    return grid.map(row => row.map(cell => (cell === "" ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : cell)));
};

// Render the grid to the screen
const renderGrid = () => {
    const words = getWordsForLevel();
    const gridSize = levels[currentLevel].gridSize;
    const grid = generateGrid(gridSize, words);

    const gridContainer = document.getElementById("grid");
    gridContainer.innerHTML = "";
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;

    grid.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement("div");
            cell.classList.add("grid-cell");
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            cell.dataset.letter = letter;
            cell.addEventListener("mousedown", () => startSelection(cell));
            cell.addEventListener("mouseover", () => continueSelection(cell));
            cell.addEventListener("mouseup", endSelection);
            gridContainer.appendChild(cell);
        });
    });

    renderWordList(words);
};

// Render the word list
const renderWordList = (words) => {
    const wordListContainer = document.getElementById("words");
    wordListContainer.innerHTML = "";

    words.forEach(word => {
        const listItem = document.createElement("li");
        listItem.textContent = word;
        listItem.dataset.word = word;
        wordListContainer.appendChild(listItem);
    });
};

// Handle the start of selection when a cell is clicked
const startSelection = (cell) => {
    isDragging = true;
    selectedCells = [cell];
    cell.classList.add("selected");
};

// Handle the continuing selection as the mouse hovers over the grid
const continueSelection = (cell) => {
    if (isDragging && !selectedCells.includes(cell)) {
        selectedCells.push(cell);
        cell.classList.add("selected");
    }
};

// Handle the end of selection when the mouse button is released
const endSelection = () => {
    if (isDragging) {
        isDragging = false;
        let selectedWord = selectedCells.map(c => c.dataset.letter).join("");

        if (getWordsForLevel().includes(selectedWord)) {
            selectedCells.forEach(c => c.classList.add("correct"));
            foundWords.push(selectedWord);
            score += 10;
            updateScore();
            strikeThroughWord(selectedWord);
            checkLevelCompletion();

            // Play correct audio when a word is selected correctly
            correctAudio.play();
        } else {
            setTimeout(() => {
                selectedCells.forEach(c => c.classList.remove("selected"));
            }, 500);

            // Play incorrect audio when a word is selected incorrectly
            incorrectAudio.play();
        }

        selectedCells = [];
    }
};

// Strike through the word when it is found in the list
const strikeThroughWord = (word) => {
    document.querySelectorAll(`li[data-word="${word}"]`).forEach(el => {
        el.classList.add("found");
    });
};

// Update the score on the screen
function updateScore() {
    document.getElementById("score").textContent = `Score: ${score}`;
}

// Check if all words are found for the current level
const checkLevelCompletion = () => {
    if (foundWords.length === getWordsForLevel().length) {
        foundWords = [];

        if (currentLevel < levels.length - 1) {
            showLevelTransition(`Level ${currentLevel + 1} Complete!`, `Moving to Level ${currentLevel + 2}`);
        } else {
            showLevelTransition("🎉 Congratulations! 🎉", "You completed all levels!", true);
        }
    }
};
// Function to update the progress bar inside the overlay
const updateProgressBar = () => {
    const progressBar = document.getElementById("progressBar");
    const progressPercentage = ((currentLevel + 1) / levels.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
};

// Show Level Completion Transition and Progress Bar
const showLevelTransition = (title, subtitle, isFinal = false) => {
    const overlay = document.getElementById("levelCompletionOverlay");
    const completeGameBtn = document.getElementById("completeGameBtn");
    const nextLevelBtn = document.getElementById("nextLevelBtn");

    document.getElementById("overlayTitle").textContent = title;
    document.getElementById("overlaySubtitle").textContent = subtitle;

    // Update the progress bar
    updateProgressBar();

    // Show overlay with transition
    overlay.style.display = "flex";
    setTimeout(() => { overlay.style.opacity = "1"; }, 100);

    // Show the "Complete All Levels" button only if it's the last level (level 5)
    if (isFinal) {
        completeGameBtn.style.display = "inline-block"; // Show the Complete All Levels button
        nextLevelBtn.style.display = "none"; // Hide Next Level button
    } else {
        nextLevelBtn.style.display = "inline-block"; // Show the Next Level button
        completeGameBtn.style.display = "none"; // Hide Complete All Levels button
    }

    // Handle "Complete All Levels" button click (ends the game and redirects to start)
    completeGameBtn.onclick = () => {
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = "none";
            resetGame(); // Reset game and go back to start screen
            document.getElementById("startScreen").style.display = "block"; // Show start screen again
        }, 500); // Smooth fade-out effect
    };

    // Handle the "Next Level" button click (if not final level)
    nextLevelBtn.onclick = () => {
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = "none";
            currentLevel++; // Increment to the next level
            restartGame(); // Restart game for the next level
        }, 500); // Smooth fade-out effect
    };
};



// Start the timer
const startTimer = () => {
    timeLeft = 50;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Restarting level.");
            restartGame();
        }
    }, 1000);
};

// Restart the game

// Function to update background dynamically based on level
const updateBackground = () => {
    const gameContainer = document.getElementById("gameContainer");
    gameContainer.className = ""; // Remove previous class
    gameContainer.classList.add(`level-${currentLevel + 1}`);
};

// Call this function whenever a new level starts
const restartGame = () => {
    foundWords = [];
    selectedCells = [];
    score = 0;
    updateScore();
    startTimer();
    renderGrid();
    updateBackground(); // Apply the background change
};

// Call updateBackground() at the start of the game too
document.addEventListener("DOMContentLoaded", updateBackground);




// Restart button listener
document.getElementById("restart").addEventListener("click", restartGame);