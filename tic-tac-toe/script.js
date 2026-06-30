/**
 * ==========================================================================
 * Tic Tac Toe Modern Game Logic
 * ==========================================================================
 * Fully organized, typed, and well-commented for beginners and professionals.
 * Supports smooth state updates, game mechanics, and visual celebrations.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GAME STATE INITIALIZATION ---
    // Represents the 3x3 board states: empty strings denote unclicked cells
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X'; // Player X always starts first
    let isGameActive = true;  // Flag to lock clicking during animations or game over
    let scoreX = 0;          // Tracks Player X wins
    let scoreO = 0;          // Tracks Player O wins

    // --- 2. GAME MECHANICS CONSTANTS ---
    // All possible index triplets on a 1D array representing a 3x3 grid that yield a win
    const winningConditions = [
        [0, 1, 2], // Horizontal top
        [3, 4, 5], // Horizontal middle
        [6, 7, 8], // Horizontal bottom
        [0, 3, 6], // Vertical left
        [1, 4, 7], // Vertical middle
        [2, 5, 8], // Vertical right
        [0, 4, 8], // Diagonal top-left to bottom-right
        [2, 4, 6]  // Diagonal top-right to bottom-left
    ];

    // --- 3. DOM ELEMENT SELECTORS ---
    const cells = document.querySelectorAll('.cell');
    const gameStatus = document.getElementById('game-status');
    const scoreXDisplay = document.getElementById('score-x');
    const scoreODisplay = document.getElementById('score-o');
    const btnRestart = document.getElementById('btn-restart');
    const btnReset = document.getElementById('btn-reset');
    
    // Modal Selectors
    const winnerOverlay = document.getElementById('winner-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const btnModalClose = document.getElementById('btn-modal-close');
    
    // Scoreboards indicators to highlight active turn
    const playerXIndicator = document.getElementById('player-x-indicator');
    const playerOIndicator = document.getElementById('player-o-indicator');

    // --- 4. CORE INTERACTIVE EVENT HANDLERS ---

    /**
     * Triggered every time a grid cell is selected
     * @param {Event} event - The mouse click or finger tap event
     */
    function handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // Guard clause: ignore clicks if the cell is occupied or game is locked
        if (board[clickedCellIndex] !== '' || !isGameActive) {
            return;
        }

        // Execute player turn
        recordMove(clickedCell, clickedCellIndex);
        
        // Evaluate if this turn resolves the game
        evaluateRules();
    }

    /**
     * Commits the player token onto the board index and updates button visuals
     * @param {HTMLElement} cellElement - The clicked cell button DOM element
     * @param {number} index - Index in the board array (0 to 8)
     */
    function recordMove(cellElement, index) {
        // Record token in state array
        board[index] = currentPlayer;
        
        // Render token value inside the button
        cellElement.textContent = currentPlayer;
        
        // Add CSS class corresponding to the token for stylized neon glow colors
        cellElement.classList.add(currentPlayer.toLowerCase());
        
        // Accessibility: update aria label once selected
        cellElement.setAttribute('aria-label', `Cell ${index + 1}, Played ${currentPlayer}`);

        // Perform minor physical pulse vibration for touch screen haptics
        triggerPhysicalHaptic();
    }

    /**
     * Hands over turn control to the alternative player
     */
    function toggleTurn() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        
        // Re-render Turn message
        gameStatus.innerHTML = `Player <span class="current-player">${currentPlayer}</span>'s Turn`;
        
        // Toggle neon visual indicators and states on Turn Banner
        if (currentPlayer === 'X') {
            gameStatus.className = 'turn-x';
            playerXIndicator.classList.add('active');
            playerOIndicator.classList.remove('active');
        } else {
            gameStatus.className = 'turn-o';
            playerOIndicator.classList.add('active');
            playerXIndicator.classList.remove('active');
        }
    }

    /**
     * Audits board status looking for lines, draws, or ongoing turns
     */
    function evaluateRules() {
        let roundWon = false;
        let victoriousCombination = null;

        // Iterate through all possible win combination lines
        for (let i = 0; i < winningConditions.length; i++) {
            const currentWinRow = winningConditions[i];
            const firstCell = board[currentWinRow[0]];
            const secondCell = board[currentWinRow[1]];
            const thirdCell = board[currentWinRow[2]];

            // Skip checking this condition if any of its slots are empty
            if (firstCell === '' || secondCell === '' || thirdCell === '') {
                continue;
            }

            // If three adjacent matching tokens are found, we have a victor!
            if (firstCell === secondCell && secondCell === thirdCell) {
                roundWon = true;
                victoriousCombination = currentWinRow;
                break;
            }
        }

        // Handle Victory Scenario
        if (roundWon) {
            handleWinnerFound(victoriousCombination);
            return;
        }

        // Handle Tie/Draw Scenario (no empty slots remain)
        const roundDraw = !board.includes('');
        if (roundDraw) {
            handleDrawFound();
            return;
        }

        // Game continues, change players
        toggleTurn();
    }

    /**
     * Resolves victory states, increments scoreboards, triggers animations
     * @param {Array<number>} winningCells - Array indexes of winning cell triplet
     */
    function handleWinnerFound(winningCells) {
        isGameActive = false; // Halt active cell clicks

        // Highlight cells visually on the game board
        winningCells.forEach(index => {
            cells[index].classList.add('winning-cell');
        });

        // Increment respective score
        if (currentPlayer === 'X') {
            scoreX++;
            scoreXDisplay.textContent = scoreX;
        } else {
            scoreO++;
            scoreODisplay.textContent = scoreO;
        }

        // Bring up the winner celebration modal after cell pulse animations finish
        setTimeout(() => {
            showGameAlert('Winner!', `Player ${currentPlayer} has won the round!`);
            generateConfetti();
        }, 500);
    }

    /**
     * Handles Draw situation
     */
    function handleDrawFound() {
        isGameActive = false;
        
        setTimeout(() => {
            showGameAlert('It\'s a Tie!', 'Both players fought a perfect game.');
        }, 400);
    }

    /**
     * Displays custom popups instead of generic window.alert
     * @param {string} title - Modal heading text
     * @param {string} msg - Modal description/subtext
     */
    function showGameAlert(title, msg) {
        modalTitle.textContent = title;
        modalMessage.textContent = msg;
        winnerOverlay.classList.add('show');
        winnerOverlay.focus();
    }

    /**
     * Closes the dialog card overlay
     */
    function dismissAlert() {
        winnerOverlay.classList.remove('show');
        restartRound();
    }

    /**
     * Resets current board arrays and displays to begin a new round
     */
    function restartRound() {
        // Reset state
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        currentPlayer = 'X'; // Player X always leads new rounds
        
        // Reset turn state styling
        gameStatus.innerHTML = `Player <span class="current-player">X</span>'s Turn`;
        gameStatus.className = 'turn-x';
        playerXIndicator.classList.add('active');
        playerOIndicator.classList.remove('active');

        // Restore cell buttons
        cells.forEach((cell, index) => {
            cell.textContent = '';
            cell.className = 'cell'; // clears X, O, and winner styles
            cell.setAttribute('aria-label', `Cell ${index + 1}, Empty`);
        });
    }

    /**
     * Clears all rounds plus cumulative score points
     */
    function resetEntireGame() {
        restartRound();
        scoreX = 0;
        scoreO = 0;
        scoreXDisplay.textContent = '0';
        scoreODisplay.textContent = '0';
    }

    // --- 5. VISUAL EFFECTS & CELEBRATIONS ---

    /**
     * Generates responsive vanilla CSS particle confetti falling from top
     */
    function generateConfetti() {
        const particleColors = ['#ff007f', '#00f0ff', '#4361ee', '#9d4edd', '#ffbe0b'];
        const bodyElement = document.body;
        
        // Spawns 70 confetti items with randomized velocities, positions, and colors
        for (let i = 0; i < 70; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti-particle');
            
            // Randomize parameters
            const size = Math.random() * 8 + 6; // sizes between 6px and 14px
            const chosenColor = particleColors[Math.floor(Math.random() * particleColors.length)];
            const startingLeftOffset = Math.random() * 100; // random horizontal starting point (vw)
            const animationDuration = Math.random() * 2 + 1.5; // fall speed (seconds)
            const animationDelay = Math.random() * 0.4; // delay to stagger drops (seconds)
            
            // Inject styles directly
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            confetti.style.backgroundColor = chosenColor;
            confetti.style.left = startingLeftOffset + 'vw';
            
            // Generate circles, squares, and triangles
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%'; // Circle
            } else if (Math.random() > 0.3) {
                confetti.style.borderRadius = '3px'; // Rounded Square
            } else {
                confetti.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'; // Triangle
            }
            
            confetti.style.animation = `confettiFall ${animationDuration}s linear ${animationDelay}s forwards`;
            
            bodyElement.appendChild(confetti);
            
            // Auto garbage-collect/remove the confetti element from memory after fall
            setTimeout(() => {
                confetti.remove();
            }, (animationDuration + animationDelay) * 1000);
        }
    }

    /**
     * Triggers mobile haptic physical feedback if browser supports it
     */
    function triggerPhysicalHaptic() {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(15); // Short, crisp 15ms click pulse
        }
    }

    // --- 6. EVENT LISTENER REGISTRATION ---
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    btnRestart.addEventListener('click', restartRound);
    btnReset.addEventListener('click', resetEntireGame);
    btnModalClose.addEventListener('click', dismissAlert);

    // Optional Keyboard accessibility support (Arrow keys navigating grid cells)
    document.getElementById('board').addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if (!active || !active.classList.contains('cell')) return;
        
        const currentIndex = parseInt(active.getAttribute('data-index'));
        let targetIndex = null;
        
        switch (e.key) {
            case 'ArrowRight':
                if (currentIndex % 3 < 2) targetIndex = currentIndex + 1;
                break;
            case 'ArrowLeft':
                if (currentIndex % 3 > 0) targetIndex = currentIndex - 1;
                break;
            case 'ArrowDown':
                if (currentIndex < 6) targetIndex = currentIndex + 3;
                break;
            case 'ArrowUp':
                if (currentIndex > 2) targetIndex = currentIndex - 3;
                break;
        }
        
        if (targetIndex !== null) {
            const targetCell = document.querySelector(`.cell[data-index="${targetIndex}"]`);
            if (targetCell) {
                targetCell.focus();
                e.preventDefault();
            }
        }
    });
});
